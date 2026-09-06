const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        retryWrites: true,
      });
      logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      logger.error(`MongoDB Connection Attempt ${attempt}/${retries} Error: ${error.message}`);
      if (attempt < retries) {
        logger.info(`Retrying MongoDB connection in 3 seconds...`);
        await new Promise((r) => setTimeout(r, 3000));
      } else {
        logger.warn(`Note: Ensure MongoDB is running at ${env.MONGO_URI} for persistent verification records.`);
        return null;
      }
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    logger.info("MongoDB disconnected successfully.");
  } catch (error) {
    logger.error("Error disconnecting MongoDB: %s", error.message);
  }
};

module.exports = { connectDB, disconnectDB };
