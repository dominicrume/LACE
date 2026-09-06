"""LCX Core API — intake, triage, routes, scorecard, health."""
import logging
from typing import Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, create_engine, select

import json
from lcx import classifier, cluster, queue as lcxq, sanitize, triage, storage
from lcx.config import CONFIG
from lcx.models import Item, ItemLedger
from lcx.rbac import require

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("lcx.api")

app = FastAPI(title="LCX Runnable Core (Enterprise Graduation)")

# Allow driver-app (Vite) to communicate with API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
            vision = classifier.classify(item.filename, item.declared_category or "")
        except Exception:  # noqa: BLE001
            logger.exception("classifier failed; degrading to rules-only")
            vision = None
        decision = triage.execute_triage(
            {"id": item.id, "declared_category": item.declared_category,
             "declared_condition": item.declared_condition,
             "is_electrical": item.is_electrical},
            vision,
        )
        item.workflow_state = decision["workflow_state"]
        item.suggested_destination = decision["suggested_destination"]
        item.requires_pat = decision["requires_pat"]
        item.justification = decision["justification"]
        item.vision_suggestion = decision["vision_suggestion"]
        
        ledger = ItemLedger(
            item_id=item.id,
            actor_id="AI_RULES_ENGINE",
            action="TRIAGED",
            details=json.dumps(decision)
        )
        
        s.add(item)
        s.add(ledger)
        s.commit()
        logger.info("triaged item=%s -> %s", item.id, decision["suggested_destination"])


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
        
        ledger = ItemLedger(
            item_id=item.id,
            actor_id=auth_ctx["sub"],
            action="REPORTED",
            details=json.dumps({"declared_condition": declared_condition, "is_electrical": is_electrical})
        )
        s.add(ledger); s.commit()
        
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
        
        ledger = ItemLedger(
            item_id=item.id,
            actor_id=auth_ctx["sub"],
            action="OVERRIDDEN",
            details=json.dumps({"new_destination": destination})
        )
        
        s.add(item)
        s.add(ledger)
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
    return {"status": "ok", "queue": "in-process", "db": "sqlite"}
