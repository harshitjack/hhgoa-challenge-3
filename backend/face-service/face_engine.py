import logging
import cv2
import numpy as np
from insightface.app import FaceAnalysis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("face_engine")

class FaceEngine:
    def __init__(self, model_name: str = "buffalo_s", det_size: tuple = (640, 640)):
        """
        Initialize InsightFace FaceAnalysis.
        Uses CPU by default (ctx_id=-1).
        buffalo_s is lightweight and fast; buffalo_l can also be used if higher precision is desired.
        """
        self.model_name = model_name
        self.det_size = det_size
        self.app = None
        self._initialize_model()

    def _initialize_model(self):
        try:
            logger.info(f"Loading InsightFace model: {self.model_name}...")
            # providers=['CPUExecutionProvider'] ensures standard compatibility across platforms
            self.app = FaceAnalysis(name=self.model_name, providers=['CPUExecutionProvider'])
            self.app.prepare(ctx_id=-1, det_size=self.det_size)
            logger.info("InsightFace model initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing InsightFace model '{self.model_name}': {e}")
            raise e

    def process_image_bytes(self, image_bytes: bytes) -> dict:
        """
        Processes raw image bytes, detects faces, and extracts normalized embeddings.
        Returns:
            dict containing:
                faceDetected (bool)
                faceCount (int)
                embedding (list of floats or None)
                confidence (float or None)
                boundingBox (list of floats [x1, y1, x2, y2] or None)
        """
        try:
            # Decode image bytes to OpenCV BGR format
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if img is None:
                logger.warning("Failed to decode image buffer into OpenCV matrix.")
                return {
                    "faceDetected": False,
                    "faceCount": 0,
                    "error": "DECODE_FAILED"
                }

            # Run InsightFace analysis
            faces = self.app.get(img)
            face_count = len(faces)

            if face_count == 0:
                logger.info("No face detected in the provided image.")
                return {
                    "faceDetected": False,
                    "faceCount": 0
                }

            # Select the primary face (largest bounding box or highest detection score)
            # Sorting primarily by area (width * height) so foreground face is selected
            sorted_faces = sorted(
                faces,
                key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]),
                reverse=True
            )
            primary_face = sorted_faces[0]

            embedding = primary_face.embedding
            # Normalize embedding vector (L2 norm) to ensure consistent cosine similarity
            norm = np.linalg.norm(embedding)
            if norm > 0:
                norm_embedding = (embedding / norm).tolist()
            else:
                norm_embedding = embedding.tolist()

            det_score = float(primary_face.det_score) if hasattr(primary_face, 'det_score') else 0.95
            bbox = [float(coord) for coord in primary_face.bbox]

            logger.info(f"Detected {face_count} face(s). Primary face det_score: {det_score:.4f}")

            return {
                "faceDetected": True,
                "faceCount": face_count,
                "confidence": round(det_score, 4),
                "embedding": norm_embedding,
                "boundingBox": bbox
            }

        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return {
                "faceDetected": False,
                "faceCount": 0,
                "error": str(e)
            }
