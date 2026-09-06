"""LCX deterministic triage engine.
Rule 8 (WEEE safety) and Rule 9 (AI never decides alone) live here.
The vision classification is only ever a SUGGESTION; these rules are law.
"""
from __future__ import annotations
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("lcx.triage")

ELECTRICAL_CATEGORIES = {"WEEE", "ELECTRONICS", "APPLIANCES"}
VALID_CONDITIONS = {"PERFECT_OR_NEAR_NEW", "NEEDS_REPAIR", "POOR_OR_BROKEN"}


class TriageError(ValueError):
    """Loud failure — never silently guess (Rule 4)."""


def execute_triage(item: Dict[str, Any], vision_classification: Optional[str] = None) -> Dict[str, Any]:
    """Route one item. item requires: id, declared_condition.
    Optional: declared_category, is_electrical.
    vision_classification may be None (circuit-breaker path, Rule 14)."""
    if "id" not in item:
        raise TriageError("missing field: id")
    condition = item.get("declared_condition")
    if condition not in VALID_CONDITIONS:
        raise TriageError(
            f"declared_condition must be one of {sorted(VALID_CONDITIONS)}, got: {condition!r}"
        )

    category = (item.get("declared_category") or vision_classification or "UNKNOWN").upper()
    is_electrical = bool(item.get("is_electrical")) or category in ELECTRICAL_CATEGORIES

    # RULE 1 — WEEE safety is absolute. Nothing overrides this branch.
    if is_electrical:
        logger.info("WEEE detected item=%s -> safety queue", item["id"])
        return {
            "item_id": item["id"],
            "suggested_destination": "REPAIR_HUB_SAFETY_QUEUE",
            "requires_pat": True,
            "workflow_state": "FLAGGED_FOR_INSPECTION",
            "justification": "UK WEEE safety compliance: electrical items require PAT sign-off by a hub technician.",
            "vision_suggestion": vision_classification,
        }

    # RULE 2 — circular-economy hierarchy.
    if condition == "PERFECT_OR_NEAR_NEW":
        dest, state, why = ("COMMUNITY_MARKETPLACE", "READY_FOR_DIRECT_REUSE",
                            "Tier 1 of the waste hierarchy: direct reuse.")
    elif condition == "NEEDS_REPAIR":
        dest, state, why = ("REPAIR_HUB", "QUEUED_FOR_REFURBISHMENT",
                            "Functional item; minor restoration required.")
    else:
        dest, state, why = ("PARTS_RECOVERY_OR_RECYCLE", "SALVAGE_DECONSTRUCTION",
                            "Condition unsuitable for retail; routed to parts extraction.")

    return {
        "item_id": item["id"],
        "suggested_destination": dest,
        "requires_pat": False,
        "workflow_state": state,
        "justification": why,
        "vision_suggestion": vision_classification,
    }
