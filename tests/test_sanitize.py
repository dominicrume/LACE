import pytest
from io import BytesIO
from PIL import Image
from lcx.sanitize import strip_exif


def _img_with_exif():
    img = Image.new("RGB", (10, 10), "red")
    exif = img.getexif(); exif[0x9003] = "2026:08:12 09:00:00"
    out = BytesIO(); img.save(out, format="JPEG", exif=exif)
    return out.getvalue()


def test_exif_is_stripped():
    clean = strip_exif(_img_with_exif())
    reopened = Image.open(BytesIO(clean))
    assert dict(reopened.getexif()) == {}


def test_non_image_fails_loud():
    with pytest.raises(Exception):
        strip_exif(b"definitely not an image")
