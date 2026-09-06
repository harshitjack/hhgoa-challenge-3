const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");
const blockchainController = require("../controllers/blockchain.controller");
const upload = require("../middleware/upload.middleware");

// POST /api/verification (Upload image, initiate pipeline)
router.post("/", upload.single("image"), (req, res, next) => {
  verificationController.createVerification(req, res, next);
});

// GET /api/verification/:id (Get pipeline step status)
router.get("/:id", (req, res, next) => {
  verificationController.getStatus(req, res, next);
});

// GET /api/verification/:id/results (Get final match result and content hash)
router.get("/:id/results", (req, res, next) => {
  verificationController.getResults(req, res, next);
});

// GET /api/verification/:id/blockchain (Get blockchain details for verification)
router.get("/:id/blockchain", (req, res, next) => {
  blockchainController.getBlockchainInfo(req, res, next);
});

// POST /api/verification/:id/verify (Trigger on-chain re-verification)
router.post("/:id/verify", (req, res, next) => {
  verificationController.verifyRecord(req, res, next);
});

module.exports = router;
