"""SQLModel schema — SQLite today, PostgreSQL/PostGIS by DSN swap (Rule 11)."""
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ItemLedger(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(index=True)
    actor_id: str
    action: str
    details: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
