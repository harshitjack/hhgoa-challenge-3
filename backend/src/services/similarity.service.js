const env = require("../config/env");
const logger = require("../utils/logger");

/**
 * Service for computing face vector cosine similarity.
 * IMPORTANT: Verifies facial similarity ONLY. Does not claim person identity.
 *
 * Threshold Note:
 * The default threshold (0.70) is model-dependent (e.g. InsightFace ArcFace / CosFace embeddings).
 * This threshold is NOT universal and must be calibrated for the specific model, image resolution,
 * and operational domain.
 */
class SimilarityService {
  constructor() {
    this.threshold = env.FACE_MATCH_THRESHOLD;
  }

  /**
   * Calculates mathematical cosine similarity between two 1D numerical vectors.
   * @param {number[]} vecA
   * @param {number[]} vecB
   * @returns {number} Cosine similarity in range [-1.0, 1.0]
   */
  calculateCosineSimilarity(vecA, vecB) {
    if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
      throw new Error("Invalid embedding vectors provided for similarity computation.");
    }

    if (vecA.length !== vecB.length) {
      throw new Error(`Embedding dimension mismatch: ${vecA.length} vs ${vecB.length}`);
    }

    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
      return 0.0;
    }

    const similarity = dotProduct / denominator;
    // Clamp to [-1, 1] to avoid minor float precision anomalies
    return Math.max(-1.0, Math.min(1.0, similarity));
  }

  /**
   * Evaluates candidate embeddings against the original face embedding
   * and selects the candidate with the highest similarity exceeding the threshold.
   * @param {number[]} originalEmbedding
   * @param {Array<{candidate: Object, embedding: number[], imageBuffer?: Buffer}>} candidates
   * @returns {{matched: boolean, similarity: number|null, candidate: Object|null, bestCandidateBuffer?: Buffer, matchType: string}}
   */
  findBestMatch(originalEmbedding, candidates) {
    if (!candidates || candidates.length === 0) {
      return {
        matched: false,
        similarity: null,
        candidate: null,
        matchType: "NO_CANDIDATES",
      };
    }

    let bestScore = -1.0;
    let bestCandidateObj = null;
    let bestBuffer = null;

    for (const item of candidates) {
      const sim = this.calculateCosineSimilarity(originalEmbedding, item.embedding);
      const roundedSim = Math.round(sim * 10000) / 10000;
      logger.info(`Candidate '${item.candidate.title}' similarity score: ${roundedSim}`);

      if (sim > bestScore) {
        bestScore = sim;
        bestCandidateObj = item.candidate;
        bestBuffer = item.imageBuffer;
      }
    }

    const finalScore = Math.round(bestScore * 1000) / 1000; // e.g. 0.824

    if (bestScore >= this.threshold && bestCandidateObj) {
      logger.info(`Face match confirmed: similarity ${finalScore} >= threshold ${this.threshold}`);
      return {
        matched: true,
        similarity: finalScore,
        candidate: bestCandidateObj,
        bestCandidateBuffer: bestBuffer,
        matchType: "Face match", // Explicitly "Face match" - never "Person identified"
      };
    } else {
      logger.info(`No candidate exceeded threshold ${this.threshold}. Best score: ${finalScore}`);
      return {
        matched: false,
        similarity: finalScore > -1 ? finalScore : null,
        candidate: null,
        matchType: "NO_MATCH_THRESHOLD",
      };
    }
  }
}

module.exports = new SimilarityService();
