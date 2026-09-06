const crypto = require("crypto");
const fs = require("fs");
const logger = require("../utils/logger");

/**
 * Service for computing deterministic SHA-256 cryptographic fingerprints.
 * Securely hashes matched content for tamper-evident blockchain registration.
 * Biometric data is NEVER pushed onto the blockchain.
 */
class HashService {
  /**
   * Generates a SHA-256 content fingerprint from buffer or string.
   * Formats the hash as a 0x-prefixed 32-byte hex string (bytes32).
   * @param {Buffer|string} content
   * @returns {{algorithm: string, contentHash: string, rawHex: string}}
   */
  generateContentHash(content) {
    if (!content) {
      throw new Error("Content is required to generate a fingerprint.");
    }

    const hasher = crypto.createHash("sha256");

    if (Buffer.isBuffer(content)) {
      hasher.update(content);
    } else if (typeof content === "string") {
      hasher.update(content, "utf8");
    } else {
      hasher.update(JSON.stringify(content));
    }

    const rawHex = hasher.digest("hex");
    const bytes32Hash = `0x${rawHex}`;

    logger.info(`Generated SHA-256 fingerprint: ${bytes32Hash}`);

    return {
      algorithm: "SHA-256",
      contentHash: bytes32Hash,
      rawHex: rawHex,
    };
  }

  /**
   * Generates SHA-256 hash of a file on disk.
   * @param {string} filePath
   * @returns {Promise<string>}
   */
  async generateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);

      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(`0x${hash.digest("hex")}`));
      stream.on("error", (err) => reject(err));
    });
  }
}

module.exports = new HashService();
