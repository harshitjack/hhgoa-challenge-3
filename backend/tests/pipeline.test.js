const pipelineService = require("../src/services/pipeline.service");
const faceService = require("../src/services/face.service");
const searchService = require("../src/services/search.service");
const candidateService = require("../src/services/candidate.service");
const similarityService = require("../src/services/similarity.service");
const hashService = require("../src/services/hash.service");
const blockchainService = require("../src/services/blockchain.service");
const fs = require("fs");
const path = require("path");

describe("Pipeline Service Unit & Scenario Tests", () => {
  const dummyFile = path.join(__dirname, "test-temp-img.jpg");

  beforeAll(() => {
    fs.writeFileSync(dummyFile, "fake-image-bytes");
  });

  afterAll(() => {
    if (fs.existsSync(dummyFile)) {
      fs.unlinkSync(dummyFile);
    }
  });

  it("should transition status to NO_FACE when Python face service detects 0 faces", async () => {
    const updateSpy = jest.spyOn(pipelineService, "updateProgress").mockResolvedValue({});
    jest.spyOn(hashService, "generateFileHash").mockResolvedValue("0x1234");
    jest.spyOn(faceService, "getFaceEmbedding").mockResolvedValue({
      faceDetected: false,
      faceCount: 0,
    });

    // Create a copy file for the test run so cleanup doesn't delete dummyFile
    const testCopy = path.join(__dirname, "test-copy-noface.jpg");
    fs.writeFileSync(testCopy, "image-content");

    await pipelineService.runPipeline("test-noface-id", testCopy);

    expect(updateSpy).toHaveBeenCalledWith(
      "test-noface-id",
      expect.objectContaining({
        status: "NO_FACE",
        faceDetected: false,
      })
    );
  });

  it("should transition status to NO_MATCH when search yields no candidates", async () => {
    const updateSpy = jest.spyOn(pipelineService, "updateProgress").mockResolvedValue({});
    jest.spyOn(hashService, "generateFileHash").mockResolvedValue("0x1234");
    jest.spyOn(faceService, "getFaceEmbedding").mockResolvedValue({
      faceDetected: true,
      faceCount: 1,
      confidence: 0.98,
      embedding: [0.1, 0.2, 0.3],
    });
    jest.spyOn(searchService, "searchGoogleLens").mockResolvedValue([]);

    const testCopy = path.join(__dirname, "test-copy-nomatch.jpg");
    fs.writeFileSync(testCopy, "image-content");

    await pipelineService.runPipeline("test-nomatch-id", testCopy);

    expect(updateSpy).toHaveBeenCalledWith(
      "test-nomatch-id",
      expect.objectContaining({
        status: "NO_MATCH",
      })
    );
  });

  it("should transition status to NO_MATCH when candidate similarity is below threshold", async () => {
    const updateSpy = jest.spyOn(pipelineService, "updateProgress").mockResolvedValue({});
    jest.spyOn(hashService, "generateFileHash").mockResolvedValue("0x1234");
    jest.spyOn(faceService, "getFaceEmbedding").mockResolvedValue({
      faceDetected: true,
      faceCount: 1,
      confidence: 0.98,
      embedding: [0.1, 0.2, 0.3],
    });
    jest.spyOn(searchService, "searchGoogleLens").mockResolvedValue([
      { title: "Candidate 1", url: "https://example.com/1" },
    ]);
    jest.spyOn(candidateService, "processCandidates").mockResolvedValue([
      {
        candidate: { title: "Candidate 1", url: "https://example.com/1" },
        embedding: [0.9, -0.2, -0.3],
      },
    ]);
    jest.spyOn(similarityService, "findBestMatch").mockReturnValue({
      matched: false,
      similarity: 0.35,
      candidate: null,
      matchType: "NO_MATCH_THRESHOLD",
    });

    const testCopy = path.join(__dirname, "test-copy-lowsim.jpg");
    fs.writeFileSync(testCopy, "image-content");

    await pipelineService.runPipeline("test-lowsim-id", testCopy);

    expect(updateSpy).toHaveBeenCalledWith(
      "test-lowsim-id",
      expect.objectContaining({
        status: "NO_MATCH",
        similarity: 0.35,
      })
    );
  });

  it("should run full pipeline successfully to COMPLETED when match is confirmed and on-chain verified", async () => {
    const updateSpy = jest.spyOn(pipelineService, "updateProgress").mockResolvedValue({});
    jest.spyOn(hashService, "generateFileHash").mockResolvedValue("0x1234");
    jest.spyOn(faceService, "getFaceEmbedding").mockResolvedValue({
      faceDetected: true,
      faceCount: 1,
      confidence: 0.98,
      embedding: [0.1, 0.2, 0.3],
    });
    jest.spyOn(searchService, "searchGoogleLens").mockResolvedValue([
      { title: "Verified Match Post", url: "https://instagram.com/p/match" },
    ]);
    jest.spyOn(candidateService, "processCandidates").mockResolvedValue([
      {
        candidate: {
          title: "Verified Match Post",
          url: "https://instagram.com/p/match",
          source: "instagram.com",
          imageUrl: "https://instagram.com/match.jpg",
        },
        embedding: [0.1, 0.21, 0.3],
        imageBuffer: Buffer.from("matched-img-data"),
      },
    ]);
    jest.spyOn(similarityService, "findBestMatch").mockReturnValue({
      matched: true,
      similarity: 0.92,
      candidate: {
        title: "Verified Match Post",
        url: "https://instagram.com/p/match",
        source: "instagram.com",
        imageUrl: "https://instagram.com/match.jpg",
      },
      bestCandidateBuffer: Buffer.from("matched-img-data"),
      matchType: "Face match",
    });
    jest.spyOn(hashService, "generateContentHash").mockReturnValue({
      algorithm: "SHA-256",
      contentHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      rawHex: "11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
    });
    jest.spyOn(blockchainService, "registerContent").mockResolvedValue({
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      blockNumber: 54321,
      contractAddress: "0xContractAddress123",
      network: "Polygon Amoy",
      timestamp: 1710000000,
    });
    jest.spyOn(blockchainService, "reverifyOnChain").mockResolvedValue({
      verified: true,
      currentHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      onChainHash: "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
    });

    const testCopy = path.join(__dirname, "test-copy-success.jpg");
    fs.writeFileSync(testCopy, "image-content");

    await pipelineService.runPipeline("test-success-id", testCopy);

    expect(updateSpy).toHaveBeenCalledWith(
      "test-success-id",
      expect.objectContaining({
        status: "COMPLETED",
        "steps.reverification": "COMPLETED",
      })
    );
  });
});
