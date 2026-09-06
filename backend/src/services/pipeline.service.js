const fs = require("fs");
const Verification = require("../models/verification.model");
const faceService = require("./face.service");
const searchService = require("./search.service");
const candidateService = require("./candidate.service");
const similarityService = require("./similarity.service");
const hashService = require("./hash.service");
const blockchainService = require("./blockchain.service");
const logger = require("../utils/logger");

/**
 * Orchestrates the end-to-end asynchronous verification pipeline.
 */
class PipelineService {
  /**
   * Safe file deletion helper to prevent retaining unneeded biometric files.
   * @param {string} filePath
   */
  async cleanupFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`Temporary file cleaned up: ${filePath}`);
      }
    } catch (err) {
      logger.warn(`Failed to cleanup file ${filePath}: ${err.message}`);
    }
  }

  /**
   * Updates database record status, step progress, and logs progress.
   * @param {string} verificationId
   * @param {Object} updates
   */
  async updateProgress(verificationId, updates) {
    try {
      return await Verification.findOneAndUpdate(
        { verificationId },
        { $set: updates },
        { new: true }
      );
    } catch (err) {
      logger.error(`Failed to update DB progress for ${verificationId}: ${err.message}`);
    }
  }

  /**
   * Executes the full verification pipeline asynchronously.
   * @param {string} verificationId
   * @param {string} filePath - Path to uploaded image file
   */
  async runPipeline(verificationId, filePath) {
    logger.info(`[Pipeline] [${verificationId}] Starting asynchronous verification pipeline...`);

    try {
      // Step 1 & 2: Face Detection & Embedding
      await this.updateProgress(verificationId, {
        status: "FACE_DETECTION",
        "steps.faceDetection": "PROCESSING",
      });
      logger.info(`[Pipeline] [${verificationId}] image received`);

      // Hash input image for data integrity check
      const inputImageHash = await hashService.generateFileHash(filePath);
      await this.updateProgress(verificationId, { inputImageHash });

      const faceResult = await faceService.getFaceEmbedding(filePath);

      if (!faceResult.faceDetected || faceResult.faceCount === 0) {
        logger.warn(`[Pipeline] [${verificationId}] No face detected in uploaded image.`);
        await this.updateProgress(verificationId, {
          status: "NO_FACE",
          faceDetected: false,
          faceConfidence: 0,
          "steps.faceDetection": "FAILED",
        });
        await this.cleanupFile(filePath);
        return;
      }

      logger.info(`[Pipeline] [${verificationId}] face detected (count: ${faceResult.faceCount}, confidence: ${faceResult.confidence})`);

      await this.updateProgress(verificationId, {
        status: "EMBEDDING",
        faceDetected: true,
        faceConfidence: faceResult.confidence || 0,
        "steps.faceDetection": "COMPLETED",
        "steps.embedding": "PROCESSING",
      });

      const originalEmbedding = faceResult.embedding;
      logger.info(`[Pipeline] [${verificationId}] embedding generated (dimension: ${originalEmbedding.length})`);

      await this.updateProgress(verificationId, {
        "steps.embedding": "COMPLETED",
      });

      // Step 3: Reverse Image Search (Google Lens via SerpAPI)
      await this.updateProgress(verificationId, {
        status: "WEB_SEARCH",
        "steps.webSearch": "PROCESSING",
      });
      logger.info(`[Pipeline] [${verificationId}] reverse search started`);

      let candidateResults = [];
      try {
        candidateResults = await searchService.searchGoogleLens(filePath);
      } catch (searchError) {
        logger.error(`[Pipeline] [${verificationId}] Reverse search error: ${searchError.message}`);
        throw new Error(`Reverse image search failed: ${searchError.message}`);
      }

      if (!candidateResults || candidateResults.length === 0) {
        logger.info(`[Pipeline] [${verificationId}] No candidate results discovered from web search.`);
        await this.updateProgress(verificationId, {
          status: "NO_MATCH",
          "steps.webSearch": "COMPLETED",
          "steps.matchAnalysis": "SKIPPED",
          "steps.hash": "SKIPPED",
          "steps.blockchain": "SKIPPED",
          "steps.reverification": "SKIPPED",
        });
        await this.cleanupFile(filePath);
        return;
      }

      logger.info(`[Pipeline] [${verificationId}] candidate discovered (${candidateResults.length} candidates)`);
      await this.updateProgress(verificationId, {
        "steps.webSearch": "COMPLETED",
      });

      // Step 4: Candidate Face Extraction & Similarity Comparison
      await this.updateProgress(verificationId, {
        status: "MATCH_ANALYSIS",
        "steps.matchAnalysis": "PROCESSING",
      });

      // Extract faces from candidates independently
      const processedCandidates = await candidateService.processCandidates(candidateResults);
      logger.info(`[Pipeline] [${verificationId}] candidate analyzed (${processedCandidates.length} with valid faces)`);

      if (processedCandidates.length === 0) {
        logger.info(`[Pipeline] [${verificationId}] No candidate images contained detectable faces.`);
        await this.updateProgress(verificationId, {
          status: "NO_MATCH",
          "steps.matchAnalysis": "COMPLETED",
          "steps.hash": "SKIPPED",
          "steps.blockchain": "SKIPPED",
          "steps.reverification": "SKIPPED",
        });
        await this.cleanupFile(filePath);
        return;
      }

      // Calculate Cosine Similarity & Select Best Match
      const matchResult = similarityService.findBestMatch(originalEmbedding, processedCandidates);
      logger.info(`[Pipeline] [${verificationId}] similarity calculated`);

      if (!matchResult.matched || !matchResult.candidate) {
        logger.info(`[Pipeline] [${verificationId}] No candidate met similarity threshold.`);
        await this.updateProgress(verificationId, {
          status: "NO_MATCH",
          similarity: matchResult.similarity,
          "steps.matchAnalysis": "COMPLETED",
          "steps.hash": "SKIPPED",
          "steps.blockchain": "SKIPPED",
          "steps.reverification": "SKIPPED",
        });
        await this.cleanupFile(filePath);
        return;
      }

      logger.info(`[Pipeline] [${verificationId}] match confirmed: ${matchResult.matchType} with similarity ${matchResult.similarity}`);

      await this.updateProgress(verificationId, {
        similarity: matchResult.similarity,
        matchedPost: {
          title: matchResult.candidate.title,
          url: matchResult.candidate.url,
          source: matchResult.candidate.source,
          imageUrl: matchResult.candidate.imageUrl,
        },
        "steps.matchAnalysis": "COMPLETED",
      });

      // Step 5: SHA-256 Content Fingerprinting
      await this.updateProgress(verificationId, {
        status: "HASHING",
        "steps.hash": "PROCESSING",
      });

      // Deterministically fingerprint the verified content (buffer if downloaded, or normalized payload)
      const contentToHash = matchResult.bestCandidateBuffer || Buffer.from(`${matchResult.candidate.url}:${matchResult.similarity}`);
      const hashResult = hashService.generateContentHash(contentToHash);
      logger.info(`[Pipeline] [${verificationId}] hash generated: ${hashResult.contentHash}`);

      await this.updateProgress(verificationId, {
        contentHash: hashResult.contentHash,
        "steps.hash": "COMPLETED",
      });

      // Step 6: Blockchain Registration on Polygon Amoy
      await this.updateProgress(verificationId, {
        status: "BLOCKCHAIN",
        "steps.blockchain": "PROCESSING",
      });
      logger.info(`[Pipeline] [${verificationId}] blockchain transaction submitted`);

      let chainRecord;
      try {
        chainRecord = await blockchainService.registerContent(
          hashResult.contentHash,
          matchResult.candidate.url
        );
      } catch (bcError) {
        logger.error(`[Pipeline] [${verificationId}] Blockchain registration error: ${bcError.message}`);
        throw new Error(`Blockchain registration failed: ${bcError.message}`);
      }

      logger.info(`[Pipeline] [${verificationId}] blockchain transaction confirmed (tx: ${chainRecord.transactionHash})`);

      await this.updateProgress(verificationId, {
        blockchain: {
          network: chainRecord.network,
          contractAddress: chainRecord.contractAddress,
          transactionHash: chainRecord.transactionHash,
          blockNumber: chainRecord.blockNumber,
          timestamp: chainRecord.timestamp,
          status: "CONFIRMED",
        },
        "steps.blockchain": "COMPLETED",
      });

      // Step 7: On-chain Re-verification
      await this.updateProgress(verificationId, {
        status: "REVERIFICATION",
        "steps.reverification": "PROCESSING",
      });

      const reverifyResult = await blockchainService.reverifyOnChain(hashResult.contentHash);

      if (!reverifyResult.verified) {
        throw new Error(`On-chain re-verification failed: ${reverifyResult.reason}`);
      }

      logger.info(`[Pipeline] [${verificationId}] on-chain re-verification passed!`);

      await this.updateProgress(verificationId, {
        status: "COMPLETED",
        "steps.reverification": "COMPLETED",
      });

      logger.info(`[Pipeline] [${verificationId}] verification completed`);
    } catch (pipelineError) {
      logger.error(`[Pipeline] [${verificationId}] Pipeline execution error: ${pipelineError.message}`);
      await this.updateProgress(verificationId, {
        status: "FAILED",
        error: {
          message: pipelineError.message,
          step: "PIPELINE_ERROR",
          timestamp: new Date(),
        },
      });
    } finally {
      // Ensure file cleanup is executed to prevent lingering biometric images
      await this.cleanupFile(filePath);
    }
  }
}

module.exports = new PipelineService();
