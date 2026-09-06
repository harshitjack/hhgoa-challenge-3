import os
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from face_engine import FaceEngine

app = FastAPI(
    title="InsightFace Biometric Embedding Service",
    description="Python microservice powered by InsightFace for face detection and embedding extraction.",
    version="1.0.0"
)

# Enable CORS for internal Node.js calls / tooling
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine lazily or on startup
MODEL_NAME = os.getenv("INSIGHTFACE_MODEL", "buffalo_s")
engine = None

@app.on_event("startup")
def startup_event():
    global engine
    try:
        engine = FaceEngine(model_name=MODEL_NAME)
    except Exception as e:
        print(f"Warning: Could not preload FaceEngine at startup: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "face-service",
        "model": MODEL_NAME,
        "engineLoaded": engine is not None
    }

@app.post("/face/embedding")
async def extract_face_embedding(image: UploadFile = File(...)):
    """
    Accepts an image file, detects faces, and generates facial embedding.
    Does NOT claim identity - purely extracts facial vectors for similarity comparison.
    """
    global engine
    if engine is None:
        engine = FaceEngine(model_name=MODEL_NAME)

    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image format.")

    try:
        image_bytes = await image.read()
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty image file received.")

        result = engine.process_image_bytes(image_bytes)

        if not result.get("faceDetected"):
            return {
                "faceDetected": False,
                "faceCount": result.get("faceCount", 0)
            }

        response = {
            "faceDetected": True,
            "faceCount": result["faceCount"],
            "embedding": result["embedding"],
            "confidence": result["confidence"]
        }
        return response

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face embedding extraction failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("FACE_SERVICE_PORT", "5001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
