import os
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import base64
from datetime import datetime

from app.schemas import (
    ClassificationResult,
    BatchClassificationRequest,
    BatchClassificationResponse,
    HealthResponse,
    ModelInfo,
    ResidueType,
)
from app.classifier import classifier

app = FastAPI(
    title="PERSÉA Waste Classifier",
    description="YOLOv8-based classification service for avocado waste residues",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImageClassifyRequest(BaseModel):
    image: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        model_loaded=classifier.is_loaded(),
        version="1.0.0",
    )


@app.get("/model/info", response_model=ModelInfo)
async def get_model_info():
    return ModelInfo(
        name="PERSÉA Waste Classifier",
        version="1.0.0",
        classes=classifier.get_classes(),
        input_size=(640, 640),
        accuracy=0.85,
    )


@app.post("/classify", response_model=ClassificationResult)
async def classify_image(request: ImageClassifyRequest):
    try:
        result = classifier.classify(request.image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify/upload", response_model=ClassificationResult)
async def classify_upload(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        image_base64 = base64.b64encode(contents).decode("utf-8")
        result = classifier.classify(image_base64)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/classify/batch", response_model=BatchClassificationResponse)
async def classify_batch(request: BatchClassificationRequest):
    try:
        result = classifier.classify(request.image_data)
        return BatchClassificationResponse(
            success=True,
            result=result,
        )
    except Exception as e:
        return BatchClassificationResponse(
            success=False,
            error=str(e),
        )


@app.get("/classes")
async def get_classes():
    return {
        "classes": [
            {
                "id": 0,
                "name": "SEED",
                "description": "Semilla/Hueso de aguacate",
                "color": "#8B4513",
            },
            {
                "id": 1,
                "name": "PEEL",
                "description": "Cáscara de aguacate",
                "color": "#556B2F",
            },
            {
                "id": 2,
                "name": "PULP",
                "description": "Pulpa descartada de aguacate",
                "color": "#9ACD32",
            },
            {
                "id": 3,
                "name": "BIOMASS",
                "description": "Biomasa de poda (ramas y hojas)",
                "color": "#228B22",
            },
        ]
    }


@app.get("/")
async def root():
    return {
        "name": "PERSÉA Waste Classifier",
        "version": "1.0.0",
        "description": "YOLOv8-based classification service for avocado waste residues",
        "endpoints": {
            "classify": "/classify",
            "classify_upload": "/classify/upload",
            "batch": "/classify/batch",
            "health": "/health",
            "model_info": "/model/info",
        },
    }
