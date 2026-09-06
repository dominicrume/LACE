"""Image sanitization (Rule 6): strip ALL EXIF before anything is stored.
Graduates to: dedicated microservice + YOLO face/plate blur (BLUEPRINT-MAP)."""
from io import BytesIO
from PIL import Image


def strip_exif(image_bytes: bytes) -> bytes:
    """Return the image re-encoded with zero metadata. Raises on non-images
    (loud failure, Rule 4) — this doubles as magic-number validation."""
    img = Image.open(BytesIO(image_bytes))
    img.load()
    clean = Image.new(img.mode, img.size)
    clean.putdata(list(img.getdata()))
    out = BytesIO()
    fmt = "PNG" if img.format in (None, "PNG") else "JPEG"
    if fmt == "JPEG" and clean.mode in ("RGBA", "P"):
        clean = clean.convert("RGB")
    clean.save(out, format=fmt)
    return out.getvalue()
