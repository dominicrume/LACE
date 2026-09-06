"""Route clustering (Rule 13 seam -> OSRM/PostGIS).
Greedy nearest-neighbour over jittered coords — good enough for one hub,
honest about what it is."""
import math, random
from typing import Dict, List
import requests
import logging

logger = logging.getLogger("lcx.cluster")

from lcx.config import CONFIG
JITTER_DEG = CONFIG["jitter_degrees"]  # Rule 5: public points are always fuzzed


def jitter(lat: float, lon: float, seed: int) -> Dict[str, float]:
    rnd = random.Random(seed)  # deterministic per item (Rule 2)
    return {"lat": lat + rnd.uniform(-JITTER_DEG, JITTER_DEG),
            "lon": lon + rnd.uniform(-JITTER_DEG, JITTER_DEG)}


def _dist(a, b):
    return math.hypot(a["lat"] - b["lat"], a["lon"] - b["lon"])


def greedy_route(points: List[Dict]) -> List[Dict]:
    """Order pickup points into one optimal trip using OSRM."""
    if not points:
        return []
    if len(points) == 1:
        return points
        
    # Format for OSRM: lon,lat;lon,lat
    coords_str = ";".join(f"{p['lon']},{p['lat']}" for p in points)
    url = f"http://router.project-osrm.org/trip/v1/driving/{coords_str}?roundtrip=false&source=first"
    
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("code") != "Ok" or not data.get("waypoints"):
            logger.warning("OSRM failed to find a route, falling back to original order. code=%s", data.get("code"))
            return points
            
        # OSRM returns waypoints with a waypoint_index mapping to the original array index
        waypoints = data["waypoints"]
        # Sort waypoints by their optimized index in the trip
        waypoints.sort(key=lambda w: w["waypoint_index"])
        
        # We need the original array index to pull out the items
        # waypoints[i]["original_index"] points to the original coords array index
        # wait, if they are sorted by waypoint_index, their order matches the route!
        route = [points[w["original_index"]] for w in waypoints]
        return route
    except Exception as e:
        logger.error("OSRM route clustering failed (fallback to naive): %s", str(e))
        # Fallback to naive greedy if network or OSRM fails
        return _naive_greedy(points)

def _naive_greedy(points: List[Dict]) -> List[Dict]:
    """Fallback naive greedy routing."""
    route, rest = [points[0]], points[1:]
    while rest:
        last = route[-1]
        nxt = min(rest, key=lambda p: _dist(last, p))
        route.append(nxt)
        rest.remove(nxt)
    return route
