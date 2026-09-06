"""Celery task queue (Rule 12 graduation seam -> Redis + Celery).
Same enqueue(fn, payload) contract for backwards compatibility, plus Celery app."""
import logging
from celery import Celery
from lcx.config import CONFIG

logger = logging.getLogger("lcx.queue")

celery_app = Celery(
    "lcx",
    broker=CONFIG["broker_url"],
    backend=CONFIG.get("result_backend")  # optional
)

# Optional backwards compatibility for existing code that isn't celery-aware
def enqueue(task_func, *args, **kwargs):
    # This works if task_func is already a registered @celery_app.task
    return task_func.delay(*args, **kwargs)
