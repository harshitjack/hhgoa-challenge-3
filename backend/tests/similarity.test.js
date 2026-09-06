const similarityService = require("../src/services/similarity.service");

describe("SimilarityService Unit Tests", () => {
  it("should calculate cosine similarity of identical vectors as 1.0", () => {
    const vecA = [0.2, 0.5, 0.8, -0.1];
    const vecB = [0.2, 0.5, 0.8, -0.1];

    const similarity = similarityService.calculateCosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(1.0, 5);
  });

  it("should calculate cosine similarity of orthogonal vectors as 0.0", () => {
    const vecA = [1.0, 0.0, 0.0];
    const vecB = [0.0, 1.0, 0.0];

    const similarity = similarityService.calculateCosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(0.0, 5);
  });

  it("should calculate cosine similarity of opposite vectors as -1.0", () => {
    const vecA = [0.5, 0.5, 0.5];
    const vecB = [-0.5, -0.5, -0.5];

    const similarity = similarityService.calculateCosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(-1.0, 5);
  });

  it("should throw an error on dimension mismatch", () => {
    const vecA = [1.0, 2.0];
    const vecB = [1.0, 2.0, 3.0];

    expect(() => similarityService.calculateCosineSimilarity(vecA, vecB)).toThrow(
      "Embedding dimension mismatch"
    );
  });

  it("should select the best candidate exceeding threshold and return 'Face match'", () => {
    const original = [1.0, 0.0, 0.0];

    // Candidate 1: 0.707 similarity
    const candidate1 = {
      candidate: { title: "Candidate Low", url: "https://example.com/1" },
      embedding: [0.707, 0.707, 0.0],
    };

    // Candidate 2: 0.948 similarity
    const candidate2 = {
      candidate: { title: "Candidate High", url: "https://example.com/2" },
      embedding: [0.948, 0.316, 0.0],
    };

    // Candidate 3: 0.3 similarity
    const candidate3 = {
      candidate: { title: "Candidate Poor", url: "https://example.com/3" },
      embedding: [0.3, 0.95, 0.0],
    };

    const result = similarityService.findBestMatch(original, [candidate1, candidate2, candidate3]);

    expect(result.matched).toBe(true);
    expect(result.candidate.title).toBe("Candidate High");
    expect(result.similarity).toBeGreaterThan(0.9);
    expect(result.matchType).toBe("Face match");
    expect(result.matchType).not.toBe("Person identified");
  });

  it("should return matched: false when candidates are below threshold", () => {
    const original = [1.0, 0.0, 0.0];

    const candidateLow = {
      candidate: { title: "Candidate Dissimilar", url: "https://example.com/low" },
      embedding: [0.2, 0.97, 0.0], // ~0.2 similarity
    };

    const result = similarityService.findBestMatch(original, [candidateLow]);

    expect(result.matched).toBe(false);
    expect(result.candidate).toBeNull();
    expect(result.matchType).toBe("NO_MATCH_THRESHOLD");
  });
});
