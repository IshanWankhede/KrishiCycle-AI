"""
KrishiCycle AI 2.0 — Cotton Leaf Disease Detection Inference Service
Backend service using pretrained YOLOv8 model weights (Models/best.pt)
Exposes:
  - GET  /status   : Model availability, task, class names, device info
  - POST /detect   : Real YOLOv8 leaf disease inference returning bounding boxes, 
                     annotated base64 image, primary class, and all predictions.
"""

import os
import io
import base64
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for local development ports
CORS(app, resources={r"/*": {"origins": "*"}})

# Resolve model path safely
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_PATHS = [
    os.path.join(BASE_DIR, 'Models', 'best.pt'),
    os.path.join(BASE_DIR, 'Model', 'best.pt'),
    os.path.join(BASE_DIR, 'best.pt')
]

MODEL_PATH = None
for p in POSSIBLE_PATHS:
    if os.path.exists(p):
        MODEL_PATH = p
        break

model = None
CLASS_NAMES = {}
MODEL_INIT_ERROR = None

def init_model():
    global model, CLASS_NAMES, MODEL_INIT_ERROR
    if not MODEL_PATH:
        MODEL_INIT_ERROR = f"Model weights not found. Searched paths: {POSSIBLE_PATHS}"
        logger.error(MODEL_INIT_ERROR)
        return False

    try:
        from ultralytics import YOLO
        logger.info(f"Loading YOLOv8 model from {MODEL_PATH}...")
        model = YOLO(MODEL_PATH)
        CLASS_NAMES = model.names if hasattr(model, 'names') else {}
        logger.info(f"YOLOv8 Model loaded successfully! Task: {getattr(model, 'task', 'detect')}")
        logger.info(f"Discovered {len(CLASS_NAMES)} classes: {CLASS_NAMES}")
        return True
    except Exception as e:
        MODEL_INIT_ERROR = str(e)
        logger.exception("Failed to initialize YOLO model")
        return False

# Initialize on startup
init_model()

@app.route('/status', methods=['GET'])
@app.route('/health', methods=['GET'])
def status():
    """Health check endpoint reporting model readiness and metadata."""
    if model is None:
        return jsonify({
            'status': 'unavailable',
            'model_loaded': False,
            'error': MODEL_INIT_ERROR or "Model not loaded",
            'model_path': MODEL_PATH,
            'crop_scope': 'Cotton (Gossypium hirsutum)'
        }), 503

    return jsonify({
        'status': 'ready',
        'model_loaded': True,
        'model_path': MODEL_PATH,
        'task': getattr(model, 'task', 'detect'),
        'class_names': CLASS_NAMES,
        'num_classes': len(CLASS_NAMES),
        'crop_scope': 'Cotton (Gossypium hirsutum) foliage disease inspection only'
    }), 200

@app.route('/detect', methods=['POST'])
def detect():
    """
    Accepts an uploaded cotton leaf image (multipart field 'image' or JSON base64 'image'),
    runs genuine YOLOv8 inference, and returns detected classes, confidence, and annotated image.
    """
    if model is None:
        return jsonify({
            'status': 'error',
            'message': 'Model is not initialized. ' + (MODEL_INIT_ERROR or 'Check server logs.')
        }), 503

    img = None

    # 1. Parse Multipart File Upload
    if 'image' in request.files:
        file = request.files['image']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No image file selected'}), 400
        try:
            image_bytes = file.read()
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception as e:
            logger.warning(f"Invalid image file upload: {e}")
            return jsonify({'status': 'error', 'message': 'Invalid image file format'}), 400

    # 2. Parse Base64 Image from JSON
    elif request.is_json and 'image' in request.json:
        base64_str = request.json['image']
        if ',' in base64_str:
            base64_str = base64_str.split(',', 1)[1]
        try:
            image_bytes = base64.b64decode(base64_str)
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception as e:
            logger.warning(f"Invalid base64 payload: {e}")
            return jsonify({'status': 'error', 'message': 'Invalid base64 image data'}), 400
    else:
        return jsonify({
            'status': 'error', 
            'message': "Missing 'image' in multipart form-data or JSON payload"
        }), 400

    # 3. Perform Real YOLOv8 Inference
    try:
        results = model(img)
        result = results[0]

        # 4. Generate Annotated Output Image (result.plot())
        annotated_bgr = result.plot()  # numpy array (H, W, 3) in BGR format
        annotated_rgb = annotated_bgr[:, :, ::-1]  # Convert BGR to RGB
        annotated_pil = Image.fromarray(annotated_rgb)

        buffered = io.BytesIO()
        annotated_pil.save(buffered, format="JPEG", quality=90)
        img_b64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        annotated_data_url = f"data:image/jpeg;base64,{img_b64}"

        # 5. Extract Bounding Boxes & Confidence Predictions
        all_predictions = []
        best_class = None
        best_confidence = 0.0

        if hasattr(result, 'boxes') and result.boxes is not None and len(result.boxes) > 0:
            for box in result.boxes:
                cls_id = int(box.cls[0].item())
                conf = float(box.conf[0].item())
                class_name = CLASS_NAMES.get(cls_id, f"Class_{cls_id}")
                xyxy = [round(float(coord), 1) for coord in box.xyxy[0].tolist()]

                prediction = {
                    'class_id': cls_id,
                    'class_name': class_name,
                    'confidence': round(conf * 100, 2),
                    'bbox': xyxy
                }
                all_predictions.append(prediction)

            # Sort predictions by confidence descending
            all_predictions.sort(key=lambda x: x['confidence'], reverse=True)
            best_class = all_predictions[0]['class_name']
            best_confidence = all_predictions[0]['confidence']

        return jsonify({
            'status': 'success',
            'image': annotated_data_url,
            'best_class': best_class,
            'confidence': best_confidence,
            'all_predictions': all_predictions,
            'detections_count': len(all_predictions),
            'crop_scope': 'Cotton leaf foliage inspection only',
            'disclaimer': 'Trained YOLOv8 cotton foliage diagnostic model. Consult local KVK before applying treatments.'
        }), 200

    except Exception as e:
        logger.exception("Inference execution failed")
        return jsonify({
            'status': 'error',
            'message': f"Inference execution failed: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    logger.info(f"Starting KrishiCycle YOLOv8 Cotton Leaf Disease Inference Service on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
