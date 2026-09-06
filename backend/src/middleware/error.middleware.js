const multer = require("multer");
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("API Error: %s", err.message, { stack: err.stack, path: req.path });

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size exceeds the 10MB limit.",
      });
    }
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  // Handle custom file type error
  if (err.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Handle JSON parsing errors
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      error: "Malformed JSON payload.",
    });
  }

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: err.message || "Internal server error.",
  };

  // Only expose stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
