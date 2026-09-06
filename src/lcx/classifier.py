"""Vision classifier SEAM. Real implementation using Hugging Face Transformers.
The circuit-breaker (Rule 14) means triage works even if this model fails or halts."""
import logging
from typing import Optional
from PIL import Image
import io
from lcx import storage

logger = logging.getLogger("lcx.classifier")

# Lazy load pipeline to avoid loading model weights unless needed
_pipeline = None

# Map standard ImageNet labels to LCX categories
_LABEL_MAPPING = {
    "television": "ELECTRONICS",
    "laptop": "ELECTRONICS",
    "desktop computer": "ELECTRONICS",
    "cellular telephone": "ELECTRONICS",
    "refrigerator": "APPLIANCES",
    "toaster": "APPLIANCES",
    "microwave": "APPLIANCES",
    "washing machine": "APPLIANCES",
    "sofa": "FURNITURE",
    "desk": "FURNITURE",
    "chair": "FURNITURE",
    "dining table": "FURNITURE",
    "mountain bike": "BICYCLE",
    "bicycle": "BICYCLE",
}

def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        try:
            from transformers import pipeline
            logger.info("loading vision model: google/vit-base-patch16-224")
            _pipeline = pipeline("image-classification", model="google/vit-base-patch16-224")
        except Exception as e:
            logger.error("failed to initialize vision model: %s", str(e))
            raise
    return _pipeline

def classify(filename: str = "", hint: str = "") -> Optional[str]:
    """Classifies an image downloaded from S3 using ViT."""
    if not filename:
        return None
    try:
        # Rule 6: Image retrieved from S3
        image_bytes = storage.download_bytes(filename)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Get top prediction
        classifier = _get_pipeline()
        results = classifier(image)
        if not results:
            return None
            
        top_label = results[0]["label"].lower()
        logger.info("vision model detected: %s (score: %.2f)", top_label, results[0]["score"])
        
        # Look for partial matches in the label mapping (e.g., 'television, television system' -> 'television')
        for k, cat in _LABEL_MAPPING.items():
            if k in top_label:
                return cat
                
        return None
    except Exception as e:
        logger.error("vision classification failed (circuit broken): %s", str(e))
        return None  # unknown -> rules engine handles it (never halts)
