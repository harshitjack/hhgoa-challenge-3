const request = require("supertest");
const app = require("../src/app");
const Verification = require("../src/models/verification.model");

describe("API Endpoint Integration Tests", () => {
  describe("GET /health", () => {
    it("should return health status ok", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("ok");
      expect(res.body.network).toBe("Polygon Amoy");
    });
  });

  describe("POST /api/verification - Upload & Validation", () => {
    it("should reject request when no file is uploaded", async () => {
      const res = await request(app).post("/api/verification");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("No image file provided");
    });

    it("should reject unsupported file types like text files", async () => {
      const res = await request(app)
        .post("/api/verification")
        .attach("image", Buffer.from("invalid plain text content"), "test.txt");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Invalid file type");
    });

    it("should accept valid JPG image buffer and return 202 with verificationId", async () => {
      // Mock Verification.prototype.save to avoid requiring live MongoDB in test runner
      jest.spyOn(Verification.prototype, "save").mockResolvedValueOnce({});

      // 1x1 valid JPEG hex
      const sampleJpeg = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
        0x00, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01, 0x01, 0x01,
        0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xbf, 0x00,
        0xff, 0xd9,
      ]);

      const res = await request(app)
        .post("/api/verification")
        .attach("image", sampleJpeg, "face.jpg");

      expect(res.status).toBe(202);
      expect(res.body.success).toBe(true);
      expect(res.body.verificationId).toBeDefined();
      expect(typeof res.body.verificationId).toBe("string");
    });
  });

  describe("GET /api/verification/:id", () => {
    it("should return 404 for unknown verification ID", async () => {
      jest.spyOn(Verification, "findOne").mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const res = await request(app).get("/api/verification/non-existent-id");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("should return verification steps and status for existing ID", async () => {
      const mockRecord = {
        verificationId: "test-uuid-123",
        status: "FACE_DETECTION",
        steps: {
          faceDetection: "PROCESSING",
          embedding: "PENDING",
          webSearch: "PENDING",
          matchAnalysis: "PENDING",
          hash: "PENDING",
          blockchain: "PENDING",
          reverification: "PENDING",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(Verification, "findOne").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRecord),
      });

      const res = await request(app).get("/api/verification/test-uuid-123");
      expect(res.status).toBe(200);
      expect(res.body.verificationId).toBe("test-uuid-123");
      expect(res.body.status).toBe("FACE_DETECTION");
      expect(res.body.steps.faceDetection).toBe("PROCESSING");
    });
  });

  describe("GET /api/verification/:id/results", () => {
    it("should return matched results and content hash", async () => {
      const mockRecord = {
        verificationId: "test-uuid-123",
        status: "COMPLETED",
        similarity: 0.824,
        contentHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        matchedPost: {
          title: "Public Instagram Profile Match",
          url: "https://instagram.com/p/test",
          source: "instagram.com",
          imageUrl: "https://instagram.com/test.jpg",
        },
      };

      jest.spyOn(Verification, "findOne").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRecord),
      });

      const res = await request(app).get("/api/verification/test-uuid-123/results");
      expect(res.status).toBe(200);
      expect(res.body.matched).toBe(true);
      expect(res.body.similarity).toBe(0.824);
      expect(res.body.candidate.title).toBe("Public Instagram Profile Match");
      expect(res.body.status).toBe("COMPLETED");
    });
  });

  describe("GET /api/verification/:id/blockchain", () => {
    it("should return blockchain confirmation details", async () => {
      const mockRecord = {
        verificationId: "test-uuid-123",
        contentHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        blockchain: {
          network: "Polygon Amoy",
          contractAddress: "0x1234567890123456789012345678901234567890",
          transactionHash: "0x9876543210987654321098765432109876543210987654321098765432109876",
          blockNumber: 12345,
          status: "CONFIRMED",
        },
      };

      jest.spyOn(Verification, "findOne").mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockRecord),
      });

      const res = await request(app).get("/api/verification/test-uuid-123/blockchain");
      expect(res.status).toBe(200);
      expect(res.body.network).toBe("Polygon Amoy");
      expect(res.body.blockNumber).toBe(12345);
      expect(res.body.status).toBe("CONFIRMED");
    });
  });
});
