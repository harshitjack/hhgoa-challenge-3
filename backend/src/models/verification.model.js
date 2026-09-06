const mongoose = require("mongoose");

const StepStatusEnum = ["PENDING", "PROCESSING", "COMPLETED", "FAILED", "SKIPPED"];

const StepSchema = new mongoose.Schema(
  {
    faceDetection: { type: String, enum: StepStatusEnum, default: "PENDING" },
    embedding: { type: String, enum: StepStatusEnum, default: "PENDING" },
    webSearch: { type: String, enum: StepStatusEnum, default: "PENDING" },
    matchAnalysis: { type: String, enum: StepStatusEnum, default: "PENDING" },
    hash: { type: String, enum: StepStatusEnum, default: "PENDING" },
    blockchain: { type: String, enum: StepStatusEnum, default: "PENDING" },
    reverification: { type: String, enum: StepStatusEnum, default: "PENDING" },
  },
  { _id: false }
);

const MatchedPostSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    url: { type: String, default: "" },
    source: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const BlockchainSchema = new mongoose.Schema(
  {
    network: { type: String, default: "Polygon Amoy" },
    contractAddress: { type: String, default: "" },
    transactionHash: { type: String, default: "" },
    blockNumber: { type: Number, default: null },
    timestamp: { type: Number, default: null },
    status: { type: String, default: "PENDING" },
  },
  { _id: false }
);

const ErrorDetailSchema = new mongoose.Schema(
  {
    message: { type: String, default: "" },
    step: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const VerificationSchema = new mongoose.Schema(
  {
    verificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "UPLOADED",
        "FACE_DETECTION",
        "EMBEDDING",
        "WEB_SEARCH",
        "MATCH_ANALYSIS",
        "HASHING",
        "BLOCKCHAIN",
        "REVERIFICATION",
        "COMPLETED",
        "FAILED",
        "NO_FACE",
        "NO_MATCH",
      ],
      default: "UPLOADED",
      index: true,
    },
    inputImageHash: {
      type: String,
      default: "",
    },
    faceDetected: {
      type: Boolean,
      default: false,
    },
    faceConfidence: {
      type: Number,
      default: 0,
    },
    similarity: {
      type: Number,
      default: null,
    },
    matchedPost: {
      type: MatchedPostSchema,
      default: () => ({}),
    },
    contentHash: {
      type: String,
      default: "",
    },
    blockchain: {
      type: BlockchainSchema,
      default: () => ({}),
    },
    steps: {
      type: StepSchema,
      default: () => ({}),
    },
    error: {
      type: ErrorDetailSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Verification", VerificationSchema);
