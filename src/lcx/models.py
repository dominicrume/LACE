"""SQLModel schema — SQLite today, PostgreSQL/PostGIS by DSN swap (Rule 11)."""
from datetime import datetime, timezone
from typing import Optional
import json
import hashlib
from sqlmodel import Field, SQLModel, Session, select
from pydantic import BaseModel, ConfigDict
from typing import List

class YoloDetection(BaseModel):
    class_name: str = Field(alias="class")
    confidence: float
    model_config = ConfigDict(populate_by_name=True)

class TelemetryPayload(BaseModel):
    robot_status: str
    force_vector: List[float]
    yolo_detections: List[YoloDetection]


class Item(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    resident_id: str
    declared_category: Optional[str] = None
    declared_condition: str
    is_electrical: bool = False
    filename: str = ""
    lat: float
    lon: float
    workflow_state: str = "RECEIVED"
    suggested_destination: Optional[str] = None
    requires_pat: bool = False
    justification: Optional[str] = None
    vision_suggestion: Optional[str] = None
    operator_override: Optional[str] = None  # Rule 9: overrides recorded
    yolo_classification: Optional[str] = None
    robot_force_spike_detected: bool = False
    robot_assigned_route: str = ""
    human_pat_test_passed: bool = False
    contribution_margin: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemLedger(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(index=True)
    actor_id: str
    action: str
    details: str
    previous_hash: str = Field(default="GENESIS")
    current_hash: str = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

def append_ledger_entry(session: Session, item_id: int, actor_id: str, action: str, details: str) -> ItemLedger:
    """Cryptographically links a new ledger entry to the item's previous state."""
    last_entry = session.exec(
        select(ItemLedger).where(ItemLedger.item_id == item_id).order_by(ItemLedger.id.desc())
    ).first()
    
    previous_hash = last_entry.current_hash if last_entry else "GENESIS"
    
    entry = ItemLedger(
        item_id=item_id,
        actor_id=actor_id,
        action=action,
        details=details,
        previous_hash=previous_hash,
    )
    
    # Freeze timestamp for hashing
    entry.created_at = datetime.now(timezone.utc)
    
    block_data = {
        "item_id": entry.item_id,
        "actor_id": entry.actor_id,
        "action": entry.action,
        "details": entry.details,
        "previous_hash": entry.previous_hash,
        "timestamp": entry.created_at.isoformat()
    }
    
    block_string = json.dumps(block_data, sort_keys=True).encode()
    entry.current_hash = hashlib.sha256(block_string).hexdigest()
    
    session.add(entry)
    return entry
