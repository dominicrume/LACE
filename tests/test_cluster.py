from lcx.cluster import greedy_route, jitter, JITTER_DEG


def test_jitter_is_deterministic_per_seed():
    a = jitter(52.48, -1.92, seed=7)
    b = jitter(52.48, -1.92, seed=7)
    assert a == b


def test_jitter_stays_within_bound():
    j = jitter(52.48, -1.92, seed=1)
    assert abs(j["lat"] - 52.48) <= JITTER_DEG
    assert abs(j["lon"] + 1.92) <= JITTER_DEG


def test_route_visits_every_point_once():
    pts = [{"lat": 52.48 + i * 0.001, "lon": -1.92, "item_id": i} for i in range(5)]
    route = greedy_route(list(pts))
    assert len(route) == 5
    assert {p["item_id"] for p in route} == {0, 1, 2, 3, 4}


def test_empty_route_is_empty():
    assert greedy_route([]) == []
