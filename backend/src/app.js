const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const env = require("./config/env");
const verificationRoutes = require("./routes/verification.routes");
const blockchainRoutes = require("./routes/blockchain.routes");
const errorHandler = require("./middleware/error.middleware");
const logger = require("./utils/logger");

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = [env.CLIENT_URL, "http://localhost:3000", "http://localhost:5173"];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev, can restrict in production
    },
    credentials: true,
  })
);

// Rate Limiting (100 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});
app.use("/api/", limiter);

// Body Parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Request Logging Middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "hhgoa-face-blockchain-backend",
    network: "Polygon Amoy",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use("/api/verification", verificationRoutes);
app.use("/api/blockchain", blockchainRoutes);

// Handle 404 Unknown Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
