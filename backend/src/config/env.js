const dotenv = require("dotenv");
const path = require("path");

// Load .env from backend root if present
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "5000", 10),
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
  MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hhgoa_verification",
  SERPAPI_KEY: process.env.SERPAPI_KEY || "",
  FACE_SERVICE_URL: process.env.FACE_SERVICE_URL || "http://127.0.0.1:5001",
  FACE_MATCH_THRESHOLD: parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.70"),
  POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology",
  PRIVATE_KEY: process.env.PRIVATE_KEY || "",
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "",
};

module.exports = env;
