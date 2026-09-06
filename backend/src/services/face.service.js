const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Communicates with the Python InsightFace microservice.
 * Strictly verifies facial vectors without claiming personal identity.
 */
class FaceService {
  constructor() {
    this.serviceUrl = env.FACE_SERVICE_URL;
  }

  /**
   * Sends an image file or buffer to the Python face service to detect faces
   * and extract normalized 512-d embeddings.
   * @param {string|Buffer} imageSource - Absolute file path or Buffer of image.
   * @returns {Promise<{faceDetected: boolean, faceCount: number, embedding?: number[], confidence?: number}>}
   */
  async getFaceEmbedding(imageSource) {
    const formData = new FormData();

    if (Buffer.isBuffer(imageSource)) {
      formData.append("image", imageSource, {
        filename: "image.jpg",
        contentType: "image/jpeg",
      });
    } else if (typeof imageSource === "string" && fs.existsSync(imageSource)) {
      formData.append("image", fs.createReadStream(imageSource));
    } else {
      throw new Error("Invalid image source provided to FaceService.");
    }

    try {
      logger.info(`Sending image to Python face-service at ${this.serviceUrl}/face/embedding...`);
      const response = await axios.post(`${this.serviceUrl}/face/embedding`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 20000, // 20s timeout
      });

      const data = response.data;
      logger.info(`Face service response: faceDetected=${data.faceDetected}, faceCount=${data.faceCount}`);
      return data;
    } catch (error) {
      if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
        logger.error(`Python face service unavailable at ${this.serviceUrl}. Ensure face-service/main.py is running.`);
        throw new Error(`Face processing service unavailable at ${this.serviceUrl}`);
      }

      if (error.response) {
        logger.error(`Face service returned status ${error.response.status}: ${JSON.stringify(error.response.data)}`);
        throw new Error(error.response.data.detail || "Face service returned an error");
      }

      logger.error(`Face service communication error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new FaceService();
