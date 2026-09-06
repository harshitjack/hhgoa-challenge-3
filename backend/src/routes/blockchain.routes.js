const express = require("express");
const router = express.Router();
const blockchainController = require("../controllers/blockchain.controller");

// GET /api/blockchain/:id
router.get("/:id", (req, res, next) => {
  blockchainController.getBlockchainInfo(req, res, next);
});

module.exports = router;
