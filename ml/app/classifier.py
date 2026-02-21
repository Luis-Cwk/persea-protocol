import os
import time
from typing import Optional
import numpy as np
from PIL import Image
import io
import base64

from ultralytics import YOLO
from app.schemas import ResidueType, QualityLevel, ClassificationResult

MODEL_PATH = os.getenv("MODEL_PATH", "models/waste_classifier.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

RESIDUE_CLASS_MAP = {
    0: ResidueType.SEED,
    1: ResidueType.PEEL,
    2: ResidueType.PULP,
    3: ResidueType.BIOMASS,
}

QUALITY_INDICATORS = {
    ResidueType.SEED: {
        "fresh_color_range": ((100, 80, 40), (180, 140, 100)),
        "dehydrated_color_range": ((80, 60, 30), (140, 100, 70)),
    },
    ResidueType.PEEL: {
        "fresh_color_range": ((30, 80, 30), (80, 150, 80)),
        "dehydrated_color_range": ((50, 70, 30), (100, 120, 60)),
    },
    ResidueType.PULP: {
        "fresh_color_range": ((120, 180, 50), (180, 230, 100)),
        "dehydrated_color_range": ((100, 150, 40), (160, 200, 80)),
    },
    ResidueType.BIOMASS: {
        "fresh_color_range": ((20, 60, 20), (60, 120, 60)),
        "dehydrated_color_range": ((40, 50, 20), (80, 90, 40)),
    },
}


class WasteClassifier:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.model: Optional[YOLO] = None
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            self.model = YOLO(self.model_path)
        else:
            self.model = YOLO("yolov8n.pt")

    def _decode_image(self, image_data: str) -> np.ndarray:
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        return np.array(image)

    def _estimate_quality(self, image: np.ndarray, residue_type: ResidueType) -> tuple[QualityLevel, float]:
        try:
            indicators = QUALITY_INDICATORS.get(residue_type, QUALITY_INDICATORS[ResidueType.SEED])
            
            hsv_image = np.array(Image.fromarray(image).convert("HSV"))
            h_mean = np.mean(hsv_image[:, :, 0])
            s_mean = np.mean(hsv_image[:, :, 1])
            v_mean = np.mean(hsv_image[:, :, 2])
            
            if v_mean > 150 and s_mean > 80:
                return QualityLevel.FRESH, 0.85
            elif v_mean > 100 and s_mean > 50:
                return QualityLevel.PARTIALLY_DEHYDRATED, 0.75
            else:
                return QualityLevel.PROCESSED, 0.65
                
        except Exception:
            return QualityLevel.UNKNOWN, 0.5

    def classify(self, image_data: str) -> ClassificationResult:
        start_time = time.time()

        image = self._decode_image(image_data)

        if self.model is None:
            return ClassificationResult(
                residue_type=ResidueType.SEED,
                confidence=0.0,
                quality_estimate=QualityLevel.UNKNOWN,
                quality_confidence=0.0,
                processing_time_ms=0.0,
            )

        results = self.model(image, verbose=False)

        if len(results) == 0 or len(results[0].boxes) == 0:
            return ClassificationResult(
                residue_type=ResidueType.SEED,
                confidence=0.0,
                quality_estimate=QualityLevel.UNKNOWN,
                quality_confidence=0.0,
                processing_time_ms=(time.time() - start_time) * 1000,
            )

        best_detection = results[0].boxes[0]
        class_id = int(best_detection.cls[0])
        confidence = float(best_detection.conf[0])

        residue_type = RESIDUE_CLASS_MAP.get(class_id, ResidueType.SEED)

        quality, quality_confidence = self._estimate_quality(image, residue_type)

        processing_time = (time.time() - start_time) * 1000

        return ClassificationResult(
            residue_type=residue_type,
            confidence=confidence,
            quality_estimate=quality,
            quality_confidence=quality_confidence,
            processing_time_ms=processing_time,
        )

    def classify_batch(self, images: list[str]) -> list[ClassificationResult]:
        return [self.classify(img) for img in images]

    def is_loaded(self) -> bool:
        return self.model is not None

    def get_classes(self) -> list[str]:
        return [rt.value for rt in ResidueType]


classifier = WasteClassifier()
