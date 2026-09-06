const Verification = require("../models/verification.model");

/**
 * Controller handling blockchain transaction status inspection.
 */
class BlockchainController {
  /**
   * GET /api/verification/:id/blockchain
   */
  async getBlockchainInfo(req, res, next) {
    try {
      const { id } = req.params;
      const record = await Verification.findOne({ verificationId: id }).lean();

      if (!record) {
        return res.status(404).json({
          success: false,
          error: `Verification with ID '${id}' not found.`,
        });
      }

      const bc = record.blockchain || {};

      return res.json({
        network: bc.network || "Polygon Amoy",
        contractAddress: bc.contractAddress || "",
        transactionHash: bc.transactionHash || "",
        blockNumber: bc.blockNumber !== undefined ? bc.blockNumber : null,
        contentHash: record.contentHash || "",
        status: bc.status || (bc.transactionHash ? "CONFIRMED" : "PENDING"),
      });
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new BlockchainController();
