"""Contract tests (Rule 4). The WEEE tests are the ones that matter most."""
import pytest
from lcx.triage import TriageError, execute_triage


def test_weee_always_flags_pat_even_if_condition_perfect():
    d = execute_triage({"id": 1, "declared_condition": "PERFECT_OR_NEAR_NEW",
                        "is_electrical": True}, "ELECTRONICS")
    assert d["requires_pat"] is True
    assert d["suggested_destination"] == "REPAIR_HUB_SAFETY_QUEUE"


def test_vision_alone_can_trigger_weee_rule():
    d = execute_triage({"id": 2, "declared_condition": "NEEDS_REPAIR"}, "APPLIANCES")
    assert d["requires_pat"] is True


def test_perfect_nonelectrical_goes_to_marketplace():
    d = execute_triage({"id": 3, "declared_condition": "PERFECT_OR_NEAR_NEW",
                        "declared_category": "FURNITURE"}, None)
    assert d["suggested_destination"] == "COMMUNITY_MARKETPLACE"
    assert d["requires_pat"] is False


def test_needs_repair_routes_to_repair_hub():
    d = execute_triage({"id": 4, "declared_condition": "NEEDS_REPAIR"}, None)
    assert d["suggested_destination"] == "REPAIR_HUB"


def test_broken_routes_to_salvage():
    d = execute_triage({"id": 5, "declared_condition": "POOR_OR_BROKEN"}, None)
    assert d["suggested_destination"] == "PARTS_RECOVERY_OR_RECYCLE"


def test_circuit_breaker_none_vision_still_triages():
    d = execute_triage({"id": 6, "declared_condition": "NEEDS_REPAIR"}, None)
    assert d["workflow_state"] == "QUEUED_FOR_REFURBISHMENT"


def test_bad_condition_fails_loud():
    with pytest.raises(TriageError):
        execute_triage({"id": 7, "declared_condition": "SORT_OF_OK"}, None)


def test_missing_id_fails_loud():
    with pytest.raises(TriageError):
        execute_triage({"declared_condition": "NEEDS_REPAIR"}, None)


def test_every_decision_carries_justification():
    d = execute_triage({"id": 8, "declared_condition": "POOR_OR_BROKEN"}, None)
    assert d["justification"]  # Rule 10: provenance always present
