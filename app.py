# app.py
import io
import base64
import time
from typing import List, Dict
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
import numpy as np
import cv2

# ultralytics YOLOv8
from ultralytics import YOLO

app = FastAPI(title="Waste Detector API")

# Serve static files (index.html, style.css, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Load a pretrained YOLOv8 model (COCO). Choose 'yolov8n.pt' for speed, 'yolov8m.pt' or 'l' for higher accuracy.
MODEL_NAME = "yolov8n.pt"  # change to yolov8m.pt or yolov8l.pt if you want better accuracy and have resources
model = YOLO(MODEL_NAME)  # downloads weights automatically the first time

# Map COCO class names to waste categories & integer IDs.
# We will return: class_name, waste_category, id, confidence, bbox
COCO_TO_WASTE = {
    # COCO names most relevant to waste (expand as needed)
    "bottle": ("plastic_or_glass", 1),
    "cup": ("plastic_or_paper", 2),
    "can": ("metal", 3),            # 'can' not standard COCO; 'bottle' and 'cup' are
    "wine glass": ("glass", 4),
    "knife": ("hazardous", 5),
    "fork": ("metal", 3),
    "spoon": ("metal", 3),
    "fork": ("metal", 3),
    "cell phone": ("electronics", 6),
    "book": ("paper", 7),
    "paper": ("paper", 7),
    "cardboard": ("paper", 7),
    "orange": ("organic", 8),
    "banana": ("organic", 8),
    "apple": ("organic", 8),
    "plastic bag": ("plastic", 1),
    "cup": ("plastic_or_paper", 2),
    "bench": ("other", 9),
    # fallback default
}

# Fallback mapping if exact class not in the dictionary:
DEFAULT_WASTE = ("general_waste", 9)

# Helper to map model class names to waste categories
def map_to_waste(class_name: str):
    key = class_name.lower().strip()
    # try direct
    if key in COCO_TO_WASTE:
        return COCO_TO_WASTE[key]
    # try simplified words
    if "bottle" in key:
        return ("plastic_or_glass", 1)
    if "cup" in key:
        return ("plastic_or_paper", 2)
    if "can" in key or "tin" in key:
        return ("metal", 3)
    if "paper" in key or "book" in key or "cardboard" in key:
        return ("paper", 7)
    if key in ("apple", "banana", "orange", "fruit"):
        return ("organic", 8)
    return DEFAULT_WASTE

# Request / response models (optional)
class Detection(BaseModel):
    class_name: str
    waste_category: str
    waste_id: int
    confidence: float
    bbox: List[float]  # [x1, y1, x2, y2]

@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    """
    Accepts an image upload (camera frame), runs object detection, returns detections as JSON.
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        img = np.array(image)  # HxWx3 RGB
    except Exception as e:
        return JSONResponse({"error": "invalid image", "details": str(e)}, status_code=400)

    # Run YOLOv8 inference (returns list of Results)
    # Use model.predict with numpy image
    start = time.time()
    results = model.predict(img, imgsz=640, conf=0.35, iou=0.45, max_det=30)  # tune conf/iou for your use-case
    elapsed = time.time() - start

    detections = []
    # results is a list of ultralytics.engine.results.Results objects
    for r in results:
        boxes = r.boxes  # ultralytics Boxes object
        if boxes is None:
            continue
        for box in boxes:
            cls_id = int(box.cls.cpu().numpy()) if hasattr(box, "cls") else int(box.cls)
            conf = float(box.conf.cpu().numpy()) if hasattr(box, "conf") else float(box.conf)
            xyxy = box.xyxy.cpu().numpy().tolist()[0]  # [x1,y1,x2,y2]
            class_name = model.names.get(cls_id, str(cls_id))
            waste_cat, waste_id = map_to_waste(class_name)
            detections.append(
                {
                    "class_name": class_name,
                    "waste_category": waste_cat,
                    "waste_id": waste_id,
                    "confidence": round(conf, 4),
                    "bbox": [float(x) for x in xyxy],
                }
            )

    return {"elapsed_s": elapsed, "detections": detections}

@app.get("/")
async def index():
    html = open("static/index.html", "r", encoding="utf-8").read()
    return HTMLResponse(html)
