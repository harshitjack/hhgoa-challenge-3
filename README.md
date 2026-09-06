# HH Goa 2026: Face Identification & Blockchain Verification System 

A decentralized, end-to-end identity and biometric verification system built for the **HH Goa 2026 Shortlisting Task 3**.

The platform extracts normalized biometric face embeddings using **InsightFace**, performs automated visual discovery via **Google Lens (SerpAPI)**, computes cosine similarity with extracted web candidates, generates cryptographic SHA-256 content hashes, and permanently registers verification proofs onto the **Polygon Amoy testnet** using a custom Solidity smart contract.

---



## 🌟 Key Features

- **Biometric Face Analysis**: InsightFace ONNX microservice (`buffalo_s`) extracting 512-dimensional normalized embeddings and face landmarks.
- **Genuine Reverse Image Search**: 2-step SerpAPI Google Lens visual indexing for candidate discovery.
- **Candidate Biometric Verification**: On-the-fly candidate face extraction and cosine similarity analysis.
- **Cryptographic Fingerprinting**: Deterministic SHA-256 payload hashing (`bytes32`).
- **On-Chain Immutability**: Verification record anchoring on Polygon Amoy testnet (`VerificationRegistry.sol`).
- **Live Re-Verification & Tamper Audit**: Real-time smart contract read call and interactive tamper simulation demonstration.
- **Cyberpunk Terminal UI**: Dark-mode, glassmorphism console with live step-by-step telemetry, scanner visualization, and system logs.

---



## 🏛️ Architecture

```
[ Client Frontend (React + Vite) ]
          |
          v (POST /api/verification)
[ Node.js / Express Orchestrator (Port 5000) ]
    |---> (1) Python InsightFace Service (Port 5001) -> 512-d Face Embedding
    |---> (2) Google Lens API (SerpAPI) -> Discovered Web Candidates
    |---> (3) Biometric Cosine Similarity Matching (Threshold >= 0.55)
    |---> (4) SHA-256 Content Fingerprint Generation
    |---> (5) Polygon Amoy Blockchain Registration (Ethers.js + Smart Contract)
    |---> (6) MongoDB Atlas Session & Telemetry State
```

---




## 📦 Smart Contract Details

- **Network**: Polygon Amoy Testnet (Chain ID: `80002`)
- **Contract Address**: [`0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A`](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A)
- **Explorer**: [PolygonScan Amoy Explorer](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A)

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js v18+ / v22+
- Python 3.10+ / 3.13+
- MongoDB instance (Local or Atlas)
- SerpAPI Key

### 1. Face Service (Python FastAPI)
```bash
cd backend/face-service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:5001
```
### 2. Backend Orchestrator (Node.js Express)
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, SERPAPI_KEY, PRIVATE_KEY, CONTRACT_ADDRESS
npm run dev
# Runs on http://localhost:5000
```

### 3. Frontend Client (React Vite)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# Runs on http://localhost:3000
```

---

## 🔒 Security & Anti-Tamper Verification

The smart contract stores:
- `contentHash`: Keccak256 / SHA-256 fingerprint of the verification payload.
- `similarityScore`: Cosine similarity score scaled to basis points.
- `timestamp`: Block timestamp at registration.
- `sourceUrl`: Discovered candidate source URL.

Any alteration to the image or match metadata immediately produces a mismatched hash, failing the on-chain audit.
