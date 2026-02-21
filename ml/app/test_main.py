import pytest
from fastapi.testclient import TestClient
from app.main import app
import base64
from PIL import Image
import io

client = TestClient(app)


def create_test_image(color: str = "green") -> str:
    img = Image.new("RGB", (100, 100), color=color)
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data


def test_get_classes():
    response = client.get("/classes")
    assert response.status_code == 200
    data = response.json()
    assert "classes" in data
    assert len(data["classes"]) == 4


def test_classify_image():
    image_base64 = create_test_image()
    response = client.post(
        "/classify",
        json={"image": image_base64},
    )
    assert response.status_code == 200
    data = response.json()
    assert "residue_type" in data
    assert "confidence" in data
    assert "quality_estimate" in data


def test_model_info():
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "PERSÉA Waste Classifier"
    assert len(data["classes"]) == 4


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert "endpoints" in data
