const app = require("./app");
const env = require("./config/env");
const { connectDB } = require("./config/database");
const logger = require("./utils/logger");

const startServer = async () => {
  try {
    // Connect to MongoDB BEFORE accepting requests
    const dbConn = await connectDB();
    if (!dbConn) {
      logger.warn("Server starting WITHOUT MongoDB. Some operations may fail.");
    }

    const server = app.listen(env.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` HH Goa 2026: Face Identification & Blockchain Verification Backend`);
      logger.info(` Server listening on port: ${env.PORT}`);
      logger.info(` Environment: ${env.NODE_ENV}`);
      logger.info(` Face Match Threshold: ${env.FACE_MATCH_THRESHOLD}`);
      logger.info(` Polygon Network: Polygon Amoy Testnet`);
      logger.info(` MongoDB: ${dbConn ? "CONNECTED" : "DISCONNECTED"}`);
      logger.info(`=======================================================`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server: %s", error.message);
    process.exit(1);
  }
};

startServer();
