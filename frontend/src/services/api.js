import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Mock simulation state generator (strictly when VITE_USE_MOCK === true)
let mockPipelineStep = 0;
const mockStepsOrder = [
  "FACE_DETECTION",
  "EMBEDDING",
  "WEB_SEARCH",
  "MATCH_ANALYSIS",
  "HASHING",
  "BLOCKCHAIN",
  "REVERIFICATION",
  "COMPLETED",
];

export const api = {
  /**
   * GET /health
   * Tests connection to backend server
   */
  async checkHealth() {
    if (IS_MOCK) {
      return { status: "ok", mode: "mock", service: "mock-backend" };
    }
    try {
      const res = await client.get("/health");
      return res.data;
    } catch (err) {
      return { status: "offline", error: err.message };
    }
  },

  /**
   * POST /api/verification
   * Accepts image file via multipart/form-data
   */
  async createVerification(imageFile) {
    if (IS_MOCK) {
      mockPipelineStep = 0;
      await new Promise((r) => setTimeout(r, 600));
      return {
        success: true,
        verificationId: `mock-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        isMock: true,
      };
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await client.post("/api/verification", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * GET /api/verification/:id
   * Polls current status and individual step progress
   */
  async getVerification(id) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const currentStatus = mockStepsOrder[Math.min(mockPipelineStep, mockStepsOrder.length - 1)];
      mockPipelineStep = Math.min(mockPipelineStep + 1, mockStepsOrder.length - 1);

      return {
        verificationId: id,
        status: currentStatus,
        steps: {
          faceDetection: mockPipelineStep > 1 ? "COMPLETED" : "PROCESSING",
          embedding: mockPipelineStep > 2 ? "COMPLETED" : mockPipelineStep === 2 ? "PROCESSING" : "PENDING",
          webSearch: mockPipelineStep > 3 ? "COMPLETED" : mockPipelineStep === 3 ? "PROCESSING" : "PENDING",
          matchAnalysis: mockPipelineStep > 4 ? "COMPLETED" : mockPipelineStep === 4 ? "PROCESSING" : "PENDING",
          hash: mockPipelineStep > 5 ? "COMPLETED" : mockPipelineStep === 5 ? "PROCESSING" : "PENDING",
          blockchain: mockPipelineStep > 6 ? "COMPLETED" : mockPipelineStep === 6 ? "PROCESSING" : "PENDING",
          reverification: mockPipelineStep >= 7 ? "COMPLETED" : "PENDING",
        },
        error: null,
        isMock: true,
      };
    }

    const res = await client.get(`/api/verification/${id}`);
    return res.data;
  },

  /**
   * GET /api/verification/:id/results
   * Retrieves final match similarity, candidate URL, and content hash
   */
  async getResults(id) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        matched: true,
        similarity: 0.884,
        candidate: {
          title: "Public Developer Profile / Goa Hackathon 2026",
          url: "https://x.com/hhgoa/status/178857390",
          source: "x.com",
          imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
        },
        contentHash: "0x4a9d77f28bc894efb069d27192a543118cf1c569720516b39ec42b85eef6d859",
        status: "COMPLETED",
        isMock: true,
      };
    }

    const res = await client.get(`/api/verification/${id}/results`);
    return res.data;
  },

  /**
   * GET /api/verification/:id/blockchain
   * Retrieves Polygon Amoy confirmation metadata
   */
  async getBlockchainProof(id) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 300));
      return {
        network: "Polygon Amoy",
        contractAddress: "0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A",
        transactionHash: "0x892a01948bd67f4019a5840291ba68ef83920c85719302e1c9481920abce6192",
        blockNumber: 1284792,
        contentHash: "0x4a9d77f28bc894efb069d27192a543118cf1c569720516b39ec42b85eef6d859",
        status: "CONFIRMED",
        isMock: true,
      };
    }

    const res = await client.get(`/api/verification/${id}/blockchain`);
    return res.data;
  },

  /**
   * POST /api/verification/:id/verify
   * Triggers real-time read against the on-chain smart contract
   */
  async verifyContent(id) {
    if (IS_MOCK) {
      await new Promise((r) => setTimeout(r, 500));
      return {
        verified: true,
        currentHash: "0x4a9d77f28bc894efb069d27192a543118cf1c569720516b39ec42b85eef6d859",
        onChainHash: "0x4a9d77f28bc894efb069d27192a543118cf1c569720516b39ec42b85eef6d859",
        isMock: true,
      };
    }

    const res = await client.post(`/api/verification/${id}/verify`);
    return res.data;
  },
};
