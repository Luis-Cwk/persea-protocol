from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ResidueType(str, Enum):
    SEED = "SEED"
    PEEL = "PEEL"
    PULP = "PULP"
    BIOMASS = "BIOMASS"


class QualityLevel(str, Enum):
    FRESH = "FRESH"
    PARTIALLY_DEHYDRATED = "PARTIALLY_DEHYDRATED"
    PROCESSED = "PROCESSED"
    UNKNOWN = "UNKNOWN"


class ClassificationResult(BaseModel):
    residue_type: ResidueType
    confidence: float = Field(ge=0.0, le=1.0)
    quality_estimate: QualityLevel
    quality_confidence: float = Field(ge=0.0, le=1.0)
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class BatchClassificationRequest(BaseModel):
    image_data: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    variety: Optional[str] = None


class BatchClassificationResponse(BaseModel):
    success: bool
    result: Optional[ClassificationResult] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ModelInfo(BaseModel):
    name: str
    version: str
    classes: list[str]
    input_size: tuple[int, int]
    accuracy: Optional[float] = None
