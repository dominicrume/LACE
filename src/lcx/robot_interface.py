import random
import asyncio
import logging

logger = logging.getLogger("lcx.robot")

class ForceSpikeException(Exception):
    """Raised when the compliant gripper detects an anomalous load."""
    pass

def pick_item(item_id: int) -> dict:
    """
    Simulates the Kinova Gen3 arm picking an item from the intake belt.
    In a real system, this communicates over the Kortex API.
    Has a 5% chance of detecting a force spike (swollen battery / breakage).
    """
    logger.info(f"[KINOVA] Arm moving to pick item {item_id}")
    import time
    time.sleep(0.5)  # Simulate movement time
    
    # 5% force spike chance
    if random.random() < 0.05:
        logger.error(f"[KINOVA] FORCE SPIKE DETECTED on item {item_id}. Aborting pick.")
        raise ForceSpikeException("Anomalous force detected by compliant gripper.")
    
    logger.info(f"[KINOVA] Pick successful for item {item_id}")
    return {"status": "picked", "robot_id": "gen3_01", "grip_force_n": random.uniform(5.0, 15.0)}
