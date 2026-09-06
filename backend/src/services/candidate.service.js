const axios = require("axios");
const faceService = require("./face.service");
const { isSafeUrl } = require("../utils/validation");
const logger = require("../utils/logger");

/**
 * Service for independently downloading candidate images and extracting facial embeddings.
 * Verifies candidates independently rather than trusting search engine metadata.
 */
class CandidateService {
  /**
   * Downloads an image from a URL with safety checks, SSRF prevention, and timeout.
   * @param {string} imageUrl
   * @returns {Promise<Buffer|null>}
   */
  async downloadCandidateImage(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") {
      return null;
    }

    // SSRF and protocol check
    if (!isSafeUrl(imageUrl)) {
      logger.warn(`Candidate image URL rejected due to security policy: ${imageUrl}`);
      return null;
    }

    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 8000, // 8 second timeout
        maxContentLength: 8 * 1024 * 1024, // 8MB limit
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
          Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        },
      });

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("image")) {
        logger.warn(`Candidate URL returned non-image content-type: ${contentType}`);
        return null;
      }

      const buffer = Buffer.from(response.data);
      if (buffer.length < 100) {
        logger.warn("Candidate image buffer too small to contain valid image.");
        return null;
      }

      return buffer;
    } catch (error) {
      logger.warn(`Failed to download candidate image from ${imageUrl}: ${error.message}`);
      return null;
    }
  }

  /**
   * Processes a single candidate: downloads image, sends to Python face service, extracts face embedding.
   * Gracefully skips invalid, inaccessible, or non-face candidates.
   * @param {Object} candidate - Discovered candidate from search service
   * @returns {Promise<Object|null>}
   */
  async verifyCandidateFace(candidate) {
    const targetImageUrl = candidate.thumbnail || candidate.imageUrl || candidate.url;

    if (!targetImageUrl) {
      logger.warn(`Candidate '${candidate.title}' has no usable image URL.`);
      return null;
    }

    logger.info(`Analyzing candidate face for: ${candidate.title} (${targetImageUrl})...`);

    const imageBuffer = await this.downloadCandidateImage(targetImageUrl);
    if (!imageBuffer) {
      logger.warn(`Skipping candidate '${candidate.title}' due to download failure.`);
      return null;
    }

    try {
      // Independently extract face embedding using InsightFace
      const faceResult = await faceService.getFaceEmbedding(imageBuffer);

      if (!faceResult.faceDetected || !faceResult.embedding) {
        logger.info(`No face detected in candidate image for: ${candidate.title}`);
        return null;
      }

      return {
        candidate: {
          title: candidate.title,
          url: candidate.url,
          source: candidate.source,
          imageUrl: targetImageUrl,
        },
        embedding: faceResult.embedding,
        confidence: faceResult.confidence,
        faceCount: faceResult.faceCount,
        imageBuffer: imageBuffer,
      };
    } catch (err) {
      logger.warn(`Face extraction failed for candidate '${candidate.title}': ${err.message}`);
      return null;
    }
  }

  /**
   * Processes an array of candidates, filtering for those with valid facial embeddings.
   * @param {Array<Object>} candidates
   * @returns {Promise<Array<Object>>}
   */
  async processCandidates(candidates) {
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return [];
    }

    const validCandidates = [];

    for (const candidate of candidates) {
      const verified = await this.verifyCandidateFace(candidate);
      if (verified) {
        validCandidates.push(verified);
      }
    }

    logger.info(`Candidate processing complete. Extracted faces from ${validCandidates.length}/${candidates.length} candidates.`);
    return validCandidates;
  }
}

module.exports = new CandidateService();
