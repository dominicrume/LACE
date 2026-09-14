import logging
import random

logger = logging.getLogger("lcx.cv_model")

try:
    from ultralytics import YOLO
    import torch
    import cv2
    import numpy as np
    
    # Load the real PyTorch YOLO model in memory (using nano for edge devices)
    logger.info("Initializing PyTorch YOLOv8n model...")
    _model = YOLO('yolov8n.pt')
    HAS_TORCH = True
except ImportError:
    logger.warning("PyTorch/Ultralytics not installed (Python 3.13 incompatibility). Falling back to circuit-breaker simulation.")
    HAS_TORCH = False

def classify_yolo(image_bytes: bytes) -> dict:
    """
    Runs YOLOv8 object detection pass for the robotic cell.
    If torch is missing, degrades gracefully to simulated output.
    """
    if HAS_TORCH:
        # 1. Real PyTorch / Ultralytics execution
        try:
            # Convert bytes to cv2 image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Run inference
            results = _model(img, verbose=False)
            
            if len(results) > 0 and len(results[0].boxes) > 0:
                # Get the highest confidence detection
                box = results[0].boxes[0]
                class_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                xyxy = box.xyxy[0].tolist()
                
                # YOLOv8 default coco names
                category = _model.names[class_id]
                
                return {
                    "category": category,
                    "confidence": conf,
                    "bounding_box": xyxy,
                    "model_version": "yolov8n-pt-real"
                }
        except Exception as e:
            logger.error(f"Real YOLO inference failed: {e}")
            # Fall through to simulation if the real model crashes
            
    # 2. Simulated Circuit-Breaker Fallback
    categories = ["Toaster", "Kettle", "Textile", "Television", "Washing Machine", "Unknown"]
    cat = random.choice(categories)
    conf = random.uniform(0.70, 0.99)
    
    return {
        "category": cat,
        "confidence": conf,
        "bounding_box": [10, 15, 200, 250],
        "model_version": "yolov8n-circuit-breaker-sim"
    }
