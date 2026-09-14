"""LCX Core API — intake, triage, routes, scorecard, health."""
import logging
from typing import Optional
import asyncio
import os
import json

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, create_engine, select
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Response
from datetime import timedelta

from lcx import cluster, queue as lcxq, sanitize, triage, storage, cv_model, robot_interface
from lcx.auth import authenticate_user, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from lcx.config import CONFIG
from lcx.models import Item, ItemLedger, append_ledger_entry, TelemetryPayload
from lcx.rbac import require
from fastapi.templating import Jinja2Templates
from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

templates_dir = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(templates_dir, exist_ok=True)
templates = Jinja2Templates(directory=templates_dir)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("lcx.api")

app = FastAPI(title="LCX Runnable Core (Enterprise Graduation)")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Instrumentator().instrument(app).expose(app)

# Allow driver-app (Vite) to communicate with API securely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine(CONFIG["database_url"], pool_pre_ping=True)
SQLModel.metadata.create_all(engine)


@lcxq.celery_app.task(name="run_triage")
def _run_triage(item_id: int) -> None:
    """Async triage task (queue seam). Circuit-breaker: classifier failure
    degrades to metadata-only rules — intake never halts (Rule 14)."""
    with Session(engine) as s:
        item = s.get(Item, item_id)
        if not item:
            return
        try:
            # 1. Vision mock
            try:
                with open(item.filename, "rb") as f:
                    vision_res = cv_model.classify_yolo(f.read())
            except Exception:
                vision_res = cv_model.classify_yolo(b"dummy") # fallback if file not local
            vision = vision_res["category"]
            item.yolo_classification = f"{vision} (conf: {vision_res['confidence']:.2f})"
        except Exception:
            logger.exception("classifier failed; degrading to rules-only")
            vision = None
            
        # 2. Robotic Cell mock
        try:
            robot_interface.pick_item(item.id)
            force_spike = False
        except robot_interface.ForceSpikeException:
            force_spike = True
            item.robot_force_spike_detected = True

        if force_spike:
            decision = {
                "workflow_state": "HAZMAT_ABORT",
                "suggested_destination": "HAZMAT_HUMAN_INSPECTION",
                "requires_pat": False,
                "justification": "Robotic compliant gripper detected anomalous force spike.",
                "vision_suggestion": vision
            }
        else:
            decision = triage.execute_triage(
                {"id": item.id, "declared_category": item.declared_category,
                 "declared_condition": item.declared_condition,
                 "is_electrical": item.is_electrical},
                vision,
            )
            item.robot_assigned_route = decision["suggested_destination"]
            
        item.workflow_state = decision["workflow_state"]
        item.suggested_destination = decision["suggested_destination"]
        item.requires_pat = decision["requires_pat"]
        item.justification = decision["justification"]
        item.vision_suggestion = decision["vision_suggestion"]
        
        append_ledger_entry(
            s,
            item_id=item.id,
            actor_id="AI_ROBOTICS_ENGINE",
            action="TRIAGED",
            details=json.dumps(decision)
        )
        
        s.add(item)
        s.commit()
        logger.info("triaged item=%s -> %s", item.id, decision["suggested_destination"])


@app.post("/api/login")
@limiter.limit("5/minute")
async def login_for_access_token(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"], "role": user["role"]}, expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return {"message": "Login successful", "role": user["role"]}


@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logout successful"}


@app.post("/items", status_code=201)
async def report_item(
    resident_id: str = Form(...),
    declared_condition: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    declared_category: Optional[str] = Form(None),
    is_electrical: bool = Form(False),
    photo: Optional[UploadFile] = File(None),
    auth_ctx: dict = Depends(require("resident")),
):
    if declared_condition not in triage.VALID_CONDITIONS:
        raise HTTPException(422, f"declared_condition must be one of {sorted(triage.VALID_CONDITIONS)}")
    filename = ""
    if photo is not None:
        raw = await photo.read()
        try:
            _clean = sanitize.strip_exif(raw)  # Rule 6: sanitize BEFORE storage
        except Exception:
            raise HTTPException(422, "upload is not a valid image")
        # storage seam: write _clean to disk/S3 here; original raw is discarded
        filename = storage.upload_bytes(_clean, photo.filename or "image.jpg")
        
    with Session(engine) as s:
        item = Item(resident_id=resident_id, declared_category=declared_category,
                    declared_condition=declared_condition, is_electrical=is_electrical,
                    filename=filename, lat=lat, lon=lon)
        s.add(item); s.commit(); s.refresh(item)
        
        append_ledger_entry(
            s,
            item_id=item.id,
            actor_id=auth_ctx["sub"],
            action="REPORTED",
            details=json.dumps({"declared_condition": declared_condition, "is_electrical": is_electrical})
        )
        s.commit()
        
    _run_triage.delay(item.id)
    return {"item_id": item.id, "workflow_state": "RECEIVED", "triage": "queued"}


@app.get("/items/{item_id}")
def get_item(item_id: int, auth_ctx: dict = Depends(require("resident", "operator", "auditor"))):
    with Session(engine) as s:
        item = s.get(Item, item_id)
        if not item:
            raise HTTPException(404, "no such item")
        data = item.model_dump()
        if auth_ctx["role"] != "auditor":  # Rule 5: precise coords are need-to-know
            data.pop("lat", None); data.pop("lon", None)
        return data


@app.post("/items/{item_id}/override")
def operator_override(item_id: int, destination: str = Form(...),
                      auth_ctx: dict = Depends(require("operator"))):
    """Rule 9: operators may override AI/rules suggestion; override recorded."""
    with Session(engine) as s:
        item = s.get(Item, item_id)
        if not item:
            raise HTTPException(404, "no such item")
        if item.requires_pat and destination != "REPAIR_HUB_SAFETY_QUEUE":
            # Rule 8: WEEE safety outranks even the operator until PAT done
            raise HTTPException(409, "WEEE item: PAT sign-off required before re-routing")
        item.operator_override = destination
        item.suggested_destination = destination
        
        append_ledger_entry(
            s,
            item_id=item.id,
            actor_id=auth_ctx["sub"],
            action="OVERRIDDEN",
            details=json.dumps({"new_destination": destination})
        )
        
        s.add(item)
        s.commit()
        return {"item_id": item_id, "destination": destination, "recorded": True}


@app.get("/routes/today")
def routes_today(auth_ctx: dict = Depends(require("driver", "operator"))):
    with Session(engine) as s:
        items = s.exec(select(Item).where(Item.workflow_state != "RECEIVED")).all()
    pts = [{"item_id": i.id, **cluster.jitter(i.lat, i.lon, seed=i.id)} for i in items]
    return {"stops": cluster.greedy_route(pts), "count": len(pts)}


@app.get("/scorecard")
def scorecard(auth_ctx: dict = Depends(require("auditor", "operator"))):
    with Session(engine) as s:
        items = s.exec(select(Item)).all()
    total = len(items) or 1
    reuse = sum(1 for i in items if i.suggested_destination == "COMMUNITY_MARKETPLACE")
    diverted = sum(1 for i in items if i.suggested_destination
                   and i.suggested_destination != "PARTS_RECOVERY_OR_RECYCLE")
    overrides = sum(1 for i in items if i.operator_override)
    return {
        "items_total": len(items),
        "diversion_rate_pct": round(100 * diverted / total, 1),
        "reuse_share_pct": round(100 * reuse / total, 1),
        "ai_human_agreement_pct": round(100 * (1 - overrides / total), 1),
        "green_job_hours": round(len(items) / 5, 1),
    }


@app.get("/health")
def health():
    return {"status": "ok", "queue": "celery+redis", "db": "postgres", "storage": "s3/minio"}


@app.websocket("/ws/telemetry")
async def websocket_telemetry(websocket: WebSocket):
    """WebSocket endpoint streaming real-time robotic telemetry and YOLO classifications."""
    await websocket.accept()
    import random
    try:
        while True:
            # In production, we'd capture frames from the Kinova Vision module.
            # Here, we trigger the CV inference directly.
            
            # Create a dummy image (e.g., 224x224 blue square) for real PyTorch to chew on if installed
            import cv2, numpy as np
            dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
            dummy_img[:] = (255, 0, 0)
            _, encoded_img = cv2.imencode('.jpg', dummy_img)
            img_bytes = encoded_img.tobytes()
            
            try:
                cv_result = cv_model.classify_yolo(img_bytes)
                detections = [{"class": cv_result["category"], "confidence": cv_result["confidence"]}]
            except Exception:
                detections = [{"class": "Unknown", "confidence": 0.0}]

            # Fetch robot telemetry (simulated force vectors)
            try:
                robot_data = robot_interface.pick_item(999)
                status = "ACTIVE_AUTONOMY"
                fv = [random.uniform(-5, 5), random.uniform(-5, 5), robot_data["grip_force_n"]]
            except robot_interface.ForceSpikeException:
                status = "FORCE_SPIKE_ABORT"
                fv = [random.uniform(-5, 5), random.uniform(-5, 5), 25.0]

            payload = TelemetryPayload(
                robot_status=status,
                force_vector=fv,
                yolo_detections=detections
            )
            await websocket.send_json(payload.model_dump(by_alias=True))
            await asyncio.sleep(0.1)
    except Exception as e:
        print("WebSocket disconnected:", e)


@app.get("/api/safety/pending")
def api_safety_pending():
    """Returns WEEE items requiring manual PAT signoff."""
    with Session(engine) as s:
        items = s.exec(select(Item).where(Item.requires_pat == True, Item.human_pat_test_passed == False)).all()
    return items


@app.get("/api/statistics")
def api_statistics():
    """Returns all processed items for analytics."""
    with Session(engine) as s:
        items = s.exec(select(Item)).all()
    return items


@app.post("/items/{item_id}/pat_signoff")
def pat_signoff(item_id: int):
    """Human-in-the-loop PAT test signoff."""
    with Session(engine) as s:
        item = s.get(Item, item_id)
        if not item:
            raise HTTPException(404, "item not found")
        item.human_pat_test_passed = True
        item.workflow_state = "READY_FOR_MARKETPLACE"
        item.requires_pat = False
        s.add(item)
        
        append_ledger_entry(
            s,
            item_id=item.id,
            actor_id="HUMAN_TECHNICIAN",
            action="PAT_TEST_PASSED",
            details=json.dumps({"human_pat_test_passed": True})
        )
        s.commit()
        return {"status": "signed_off"}
