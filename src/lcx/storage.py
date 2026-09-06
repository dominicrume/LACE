"""S3 Storage seam for persisting sanitized images (Rule 6)."""
import logging
import uuid
import boto3
from botocore.config import Config
from lcx.config import CONFIG

logger = logging.getLogger("lcx.storage")

s3_client = boto3.client(
    "s3",
    endpoint_url=CONFIG.get("s3_endpoint_url"),
    aws_access_key_id=CONFIG.get("s3_access_key"),
    aws_secret_access_key=CONFIG.get("s3_secret_key"),
    config=Config(signature_version="s3v4")
)

def upload_bytes(file_bytes: bytes, original_filename: str) -> str:
    """Uploads sanitized bytes to S3, returns the generated object key."""
    ext = original_filename.split('.')[-1] if '.' in original_filename else 'jpg'
    object_key = f"{uuid.uuid4().hex}.{ext}"
    bucket = CONFIG["s3_bucket"]
    try:
        s3_client.put_object(
            Bucket=bucket,
            Key=object_key,
            Body=file_bytes,
            ContentType=f"image/{ext}"
        )
        logger.info("uploaded image to s3 bucket=%s key=%s", bucket, object_key)
        return object_key
    except Exception as e:
        logger.error("failed to upload image to s3: %s", str(e))
        raise

def download_bytes(object_key: str) -> bytes:
    """Download bytes from S3."""
    bucket = CONFIG["s3_bucket"]
    try:
        response = s3_client.get_object(Bucket=bucket, Key=object_key)
        return response['Body'].read()
    except Exception as e:
        logger.error("failed to download image from s3: %s", str(e))
        raise
