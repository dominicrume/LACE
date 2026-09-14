"""Config loader — Rule 3: no hardcoded config anywhere else."""
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///lcx.db"
    broker_url: str = "redis://localhost:6379/0"
    jitter_degrees: float = 0.0015
    queue: str = "in-process"
    green_job_hours_per_items: int = 5
    s3_bucket: str = "lcx-images"
    s3_endpoint_url: str = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    oidc_issuer_url: str = "http://localhost:8080/realms/lcx"
    oidc_audience: str = "lcx-api"
    lcx_jwt_secret: str = "super-secret-development-key-for-railway-testing"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
CONFIG = settings.model_dump()
