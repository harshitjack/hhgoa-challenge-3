const hashService = require("../src/services/hash.service");
const fs = require("fs");
const path = require("path");

describe("HashService Unit Tests", () => {
  it("should generate a SHA-256 fingerprint in bytes32 format (0x... 66 chars)", () => {
    const testContent = Buffer.from("test-matched-content-data");
    const result = hashService.generateContentHash(testContent);

    expect(result.algorithm).toBe("SHA-256");
    expect(result.contentHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(result.rawHex).toMatch(/^[a-f0-9]{64}$/);
    expect(result.contentHash.length).toBe(66);
  });

  it("should produce deterministic SHA-256 hash for identical input", () => {
    const content = "deterministic-check-string";
    const res1 = hashService.generateContentHash(content);
    const res2 = hashService.generateContentHash(content);

    expect(res1.contentHash).toBe(res2.contentHash);
  });

  it("should produce completely different hashes for different content", () => {
    const res1 = hashService.generateContentHash("first-content");
    const res2 = hashService.generateContentHash("second-content");

    expect(res1.contentHash).not.toBe(res2.contentHash);
  });

  it("should generate correct file hash from disk", async () => {
    const tempFilePath = path.join(__dirname, "temp-test-file.txt");
    fs.writeFileSync(tempFilePath, "sample-file-content-to-hash");

    try {
      const fileHash = await hashService.generateFileHash(tempFilePath);
      expect(fileHash).toMatch(/^0x[a-f0-9]{64}$/);
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  });
});
