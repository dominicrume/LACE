"""API contract tests — WEEE law, RBAC, PII hiding (Rules 5,7,8,9)."""
import time
from fastapi.testclient import TestClient
from lcx.main import app

c = TestClient(app)

def _report_weee():
    r = c.post("/items", headers={"X-Role": "resident"},
               data={"resident_id": "grace", "declared_condition": "NEEDS_REPAIR",
                     "declared_category": "APPLIANCES", "lat": "52.4862", "lon": "-1.9250"})
    assert r.status_code == 201
    iid = r.json()["item_id"]; time.sleep(0.4)
    return iid

def test_weee_item_lands_in_safety_queue():
    iid = _report_weee()
    j = c.get(f"/items/{iid}", headers={"X-Role": "operator"}).json()
    assert j["suggested_destination"] == "REPAIR_HUB_SAFETY_QUEUE"
    assert j["requires_pat"] is True

def test_operator_cannot_reroute_weee_before_pat():
    iid = _report_weee()
    r = c.post(f"/items/{iid}/override", headers={"X-Role": "operator"},
               data={"destination": "COMMUNITY_MARKETPLACE"})
    assert r.status_code == 409

def test_rbac_resident_blocked_from_scorecard():
    assert c.get("/scorecard", headers={"X-Role": "resident"}).status_code == 403

def test_coordinates_hidden_from_operator():
    iid = _report_weee()
    j = c.get(f"/items/{iid}", headers={"X-Role": "operator"}).json()
    assert "lat" not in j and "lon" not in j

def test_bad_condition_rejected_loud():
    r = c.post("/items", headers={"X-Role": "resident"},
               data={"resident_id": "g", "declared_condition": "MEH",
                     "lat": "52.4", "lon": "-1.9"})
    assert r.status_code == 422
