"""Config loader — Rule 3: no hardcoded config anywhere else."""
from pathlib import Path
import yaml

_DEFAULTS = {"database_url": "sqlite:///lcx.db", "broker_url": "redis://localhost:6379/0",
             "jitter_degrees": 0.0015, "queue": "in-process", "green_job_hours_per_items": 5,
             "s3_bucket": "lcx-images", "s3_endpoint_url": "http://localhost:9000",
             "s3_access_key": "minioadmin", "s3_secret_key": "minioadmin",
             "oidc_issuer_url": "http://localhost:8080/realms/lcx", "oidc_audience": "lcx-api"}

def load() -> dict:
    p = Path(__file__).resolve().parents[2] / "config.yaml"
    cfg = dict(_DEFAULTS)
    if p.exists():
        cfg.update(yaml.safe_load(p.read_text()) or {})
    return cfg

CONFIG = load()
