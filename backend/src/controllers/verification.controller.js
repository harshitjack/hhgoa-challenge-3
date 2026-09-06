const { v4: uuidv4 } = require("uuid");
const Verification = require("../models/verification.model");
const pipelineService = require("../services/pipeline.service");
const blockchainService = require("../services/blockchain.service");
const logger = require("../utils/logger");

/**
 * Controller managing face verification lifecycles.
 */
class VerificationController {
  /**
   * POST /api/verification
   * Accepts image upload, initializes verification, starts async pipeline.
   */
  async createVerification(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image file provided. Please attach an image with key 'image'.",
        });
      }

      const verificationId = uuidv4();
      logger.info(`Initiating verification request. Assigned verificationId: ${verificationId}`);

      const record = new Verification({
        verificationId,
        status: "UPLOADED",
        steps: {
          faceDetection: "PENDING",
          embedding: "PENDING",
          webSearch: "PENDING",
          matchAnalysis: "PENDING",
          hash: "PENDING",
          blockchain: "PENDING",
          reverification: "PENDING",
        },
      });

      await record.save();

      // Launch async pipeline in background without blocking HTTP response
      setImmediate(() => {
        pipelineService.runPipeline(verificationId, req.file.path);
      });

      return res.status(202).json({
        success: true,
        verificationId,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/verification/:id
   * Retrieves overall status and individual step progress.
   */
  async getStatus(req, res, next) {
    try {
      const { id } = req.params;
      const record = await Verification.findOne({ verificationId: id }).lean();

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `Verification with ID '${id}' not found.`,
        });
      }

      return res.json({
        verificationId: record.verificationId,
        status: record.status,
        steps: {
          faceDetection: record.steps?.faceDetection || "PENDING",
          embedding: record.steps?.embedding || "PENDING",
          webSearch: record.steps?.webSearch || "PENDING",
          matchAnalysis: record.steps?.matchAnalysis || "PENDING",
          hash: record.steps?.hash || "PENDING",
          blockchain: record.steps?.blockchain || "PENDING",
          reverification: record.steps?.reverification || "PENDING",
        },
        error: record.error || null,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/verification/:id/results
   * Returns matching results, similarity score, candidate metadata, and content hash.
   */
  async getResults(req, res, next) {
    try {
      const { id } = req.params;
      const record = await Verification.findOne({ verificationId: id }).lean();

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `Verification with ID '${id}' not found.`,
        });
      }

      const isMatched = record.status === "COMPLETED" && (record.similarity !== null && record.similarity !== undefined);

      return res.json({
        matched: isMatched,
        similarity: record.similarity || 0.0,
        candidate: record.matchedPost && record.matchedPost.url ? record.matchedPost : null,
        contentHash: record.contentHash || "",
        status: record.status,
      });
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/verification/:id/verify
   * On-demand on-chain re-verification.
   */
  async verifyRecord(req, res, next) {
    try {
      const { id } = req.params;
      const record = await Verification.findOne({ verificationId: id }).lean();

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `Verification with ID '${id}' not found.`,
        });
      }

      if (!record.contentHash) {
        return res.status(400).json({
          verified: false,
          reason: "NO_CONTENT_HASH_FOUND",
        });
      }

      // Re-read immutable state directly from Polygon Amoy contract
      const reverification = await blockchainService.reverifyOnChain(record.contentHash);

      return res.json(reverification);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new VerificationController();
