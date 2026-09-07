# 🛡️ TraceID — Face Identification & Blockchain Verification System

<div align="center">

[![Polygon Amoy](https://img.shields.io/badge/Blockchain-Polygon%20Amoy%20(80002)-8247E5?style=for-the-badge&logo=polygon&logoColor=white)](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-InsightFace-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

**A decentralized, production-ready biometric face verification and immutable cryptographic proof anchoring pipeline on the Polygon Amoy Testnet.**

Built for **HH Goa 2026 Shortlisting Task 3: Face Identification & Blockchain Verification**.

[Live Smart Contract](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A) • [Architecture](#-system-architecture) • [Quick Start](#-quick-start) • [API Docs](#-api-specification) • [Testing](#-testing-suite)

---

</div>

## 📌 Executive Summary

**TraceID** is an end-to-end identity verification platform that solves the digital authenticity and deepfake attribution challenge. It pairs state-of-the-art **deep biometric facial embeddings (InsightFace ArcFace)** with **live reverse visual search (Google Lens)** and anchors verifiable proof directly onto the **Polygon blockchain**.

Every verified occurrence is cryptographically hashed into an immutable `bytes32` fingerprint stored in a custom Solidity smart contract (`VerificationRegistry.sol`), enabling zero-trust third-party audits and tamper detection.

---

## 🌟 Key Features

| Capability | Implementation | Description |
| :--- | :--- | :--- |
| **🧠 Deep Biometrics** | InsightFace ONNX (`buffalo_s`) | Extracts 512-dimensional L2-normalized face embeddings and facial landmarks via FastAPI microservice. |
| **🔍 Reverse Image Discovery** | Google Lens / SerpAPI | Real-time indexing of web occurrences with dynamic visual crawling (no hardcoding). |
| **📐 Candidate Verification** | Cosine Similarity Engine | Independently fetches candidate web faces, computes embeddings, and evaluates mathematical similarity against calibrated thresholds ($\ge 0.55$). |
| **🔒 Cryptographic Fingerprinting**| Deterministic SHA-256 | Computes canonical `bytes32` content hashes linking input image, candidate source URL, and similarity score. |
| **⛓️ On-Chain Proof Anchoring** | Polygon Amoy Testnet | Broadcasts verifiable proof transactions to `VerificationRegistry.sol` with event emissions and duplicate-entry guards. |
| **🛡️ Live Anti-Tamper Audit** | EVM RPC Query & Proof Engine | Instant on-chain state verification with interactive tamper simulation tools to demonstrate cryptographic mismatch detection. |
| **⚡ Cyberpunk UI & Telemetry** | React 18 + Tailwind CSS + Framer Motion | Real-time step-by-step telemetry pipeline, animated radar scanner, audio-visual feedback, and glassmorphic HUD. |

---

## 🏛️ System Architecture

```
                                 ┌────────────────────────┐
                                 │   React + Vite UI      │
                                 │ (Port 3000 / Web HUD)  │
                                 └───────────┬────────────┘
                                             │ (1) POST /api/verification (Image)
                                             ▼
             ┌─────────────────────────────────────────────────────────────────┐
             │            Node.js / Express Orchestrator (Port 5000)           │
             │   • Rate Limiting & Helmet & Multer MIME Security               │
             │   • Asynchronous Queue & Mongoose Telemetry Tracking            │
             └───────┬───────────────────────┬─────────────────────────┬───────┘
                     │ (2) Extract           │ (3) Search              │ (4) Match
                     ▼                       ▼                         ▼
  ┌──────────────────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐
  │  Python InsightFace Service  │ │ Google Lens API  │ │ Cosine Similarity Engine │
  │   (FastAPI / Port 5001)      │ │    (SerpAPI)     │ │   • Threshold: >= 0.55   │
  │ • 512-d ArcFace Embeddings   │ │ • Discovers Web  │ │   • Candidate Face Crop  │
  │ • L2 Vector Normalization    │ │   Candidates     │ │   • Multi-Face Rejection │
  └──────────────────────────────┘ └──────────────────┘ └──────────────┬───────────┘
                                                                       │ (5) Verified Match
                                                                       ▼
                                                        ┌──────────────────────────┐
                                                        │ SHA-256 Content Finger-  │
                                                        │ print (bytes32 Payload)  │
                                                        └──────────────┬───────────┘
                                                                       │ (6) Ethers.js v6
                                                                       ▼
                                                        ┌──────────────────────────┐
                                                        │  Polygon Amoy Testnet    │
                                                        │ VerificationRegistry.sol │
                                                        │ • Tx Block Confirmation  │
                                                        │ • Immutable Proof Query  │
                                                        └──────────────────────────┘
```

---

## ⛓️ Smart Contract Specifications

* **Contract Name**: `VerificationRegistry.sol`
* **Network**: **Polygon Amoy Testnet** (Chain ID: `80002`)
* **Contract Address**: [`0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A`](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A)
* **Solidity Version**: `^0.8.24`
* **Explorer**: [View on PolygonScan Amoy](https://amoy.polygonscan.com/address/0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A)

### Contract Interface (`VerificationRegistry.sol`)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract VerificationRegistry {
    struct Record {
        bytes32 contentHash;      // SHA-256 deterministic fingerprint
        string sourceUrl;         // Discovered web candidate URL
        uint256 timestamp;        // Block timestamp of registration
        address recordedBy;       // Wallet that registered the proof
        bool exists;              // Existence flag
    }

    event ContentRegistered(bytes32 indexed contentHash, string sourceUrl, address indexed recordedBy, uint256 timestamp);

    function registerContent(bytes32 _contentHash, string calldata _sourceUrl) external returns (bool);
    function verifyContent(bytes32 _contentHash) external view returns (bool exists, string memory sourceUrl, uint256 timestamp, address recordedBy);
    function isRegistered(bytes32 _contentHash) external view returns (bool);
}
```

---

## 🚀 Quick Start

### Prerequisites

* **Node.js** v18.x or v20.x+
* **Python** 3.10+ or 3.13+
* **MongoDB** (Local instance or MongoDB Atlas cluster)
* **Polygon Amoy Wallet** funded with testnet POL ([Get faucet POL](https://faucet.polygon.technology/))
* **SerpAPI Key** ([Get free SerpAPI key](https://serpapi.com/))

---

### Step 1: Clone Repository

```bash
git clone https://github.com/harshitjack/hhgoa-challenge-3.git
cd hhgoa-challenge-3
```

---

### Step 2: Start Python Face Microservice (Port 5001)

```bash
cd backend/face-service

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows: .\venv\Scripts\activate | macOS/Linux: source venv/bin/activate

# Install dependencies & run
pip install -r requirements.txt
python main.py
```
> Verify health at `http://127.0.0.1:5001/health`

---

### Step 3: Start Backend API Server (Port 5000)

```bash
cd ../ # Navigate to backend/
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MONGO_URI, SERPAPI_KEY, PRIVATE_KEY, and CONTRACT_ADDRESS

# Start backend dev server
npm run dev
```
> Verify health at `http://localhost:5000/health`

---

### Step 4: Start Frontend Client (Port 3000)

```bash
cd ../frontend
npm install

# Setup environment variables
cp .env.example .env

# Start frontend dev server
npm run dev
```
> Open **`http://localhost:3000`** in your browser!

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hh-goafacereco

# AI & Search Services
SERPAPI_KEY=your_serpapi_key_here
FACE_SERVICE_URL=http://127.0.0.1:5001
FACE_MATCH_THRESHOLD=0.55

# Polygon Amoy Blockchain
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_polygon_amoy_private_key
CONTRACT_ADDRESS=0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_POLYGONSCAN_URL=https://amoy.polygonscan.com
VITE_CONTRACT_ADDRESS=0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A
```

---

## 📡 API Specification

### 1. Initiate Verification Pipeline
```http
POST /api/verification
Content-Type: multipart/form-data

[Form Field: "image" -> Binary image file (JPG, PNG, WEBP, max 10MB)]
```
**Response (`202 Accepted`)**:
```json
{
  "success": true,
  "verificationId": "e30f1418-42bd-48e7-9d7a-d0fa47c87c7a"
}
```

---

### 2. Poll Verification Pipeline Status
```http
GET /api/verification/:verificationId
```
**Response (`200 OK`)**:
```json
{
  "verificationId": "e30f1418-42bd-48e7-9d7a-d0fa47c87c7a",
  "status": "COMPLETED",
  "steps": {
    "faceDetection": "COMPLETED",
    "embedding": "COMPLETED",
    "webSearch": "COMPLETED",
    "matchAnalysis": "COMPLETED",
    "hash": "COMPLETED",
    "blockchain": "COMPLETED",
    "reverification": "COMPLETED"
  },
  "error": null,
  "createdAt": "2026-09-07T16:50:00.000Z"
}
```

---

### 3. Fetch Verification Results
```http
GET /api/verification/:verificationId/results
```
**Response (`200 OK`)**:
```json
{
  "matched": true,
  "similarity": 0.8842,
  "candidate": {
    "title": "Public Profile Source",
    "url": "https://example.com/profile",
    "source": "example.com",
    "imageUrl": "https://example.com/image.jpg"
  },
  "contentHash": "0x4a72d3e91b6c8f2a...32bytes",
  "status": "COMPLETED"
}
```

---

### 4. Fetch Blockchain Proof Details
```http
GET /api/verification/:verificationId/blockchain
```
**Response (`200 OK`)**:
```json
{
  "network": "Polygon Amoy",
  "contractAddress": "0x3D3F4C60c215B1D33A4d3Abf4Cb883531F31130A",
  "transactionHash": "0x789abc...64hex",
  "blockNumber": 18459201,
  "contentHash": "0x4a72d3e91b6c8f2a...32bytes",
  "status": "CONFIRMED"
}
```

---

### 5. Perform On-Chain Re-Verification (Tamper Check)
```http
POST /api/verification/:verificationId/verify
```
**Response (`200 OK`)**:
```json
{
  "verified": true,
  "currentHash": "0x4a72d3e91b6c8f2a...32bytes",
  "onChainHash": "0x4a72d3e91b6c8f2a...32bytes",
  "timestamp": 1725727800,
  "recordedBy": "0x544540c08aBff087116Bb8e8784A858BefD9774b"
}
```

---

## 🧪 Testing Suite

### 1. Smart Contract Unit Tests (Hardhat)
Validates deployment, hash storage, duplicate rejection, and zero-address safeguards:
```bash
cd backend
npm run test:contract
```

### 2. Backend Unit & Integration Tests (Jest)
Validates similarity algorithms, deterministic hashing, rate limiters, and error handlers:
```bash
cd backend
npm test
```

### 3. Automated End-to-End Test Script
Executes full image upload, pipeline execution, on-chain registration, and re-verification:
```bash
cd backend
node scripts/test-e2e.js path/to/sample_face.jpg
```

---

## 🔒 Security, Privacy & Compliance

1. **Biometric Data Minimization**: Raw face images and high-dimensional vector embeddings are **never** stored on the public blockchain. Only canonical SHA-256 hash digests (`bytes32`) are anchored.
2. **Ephemeral File Storage**: Uploaded query images are automatically unlinked and purged from temporary server disks upon completion of the pipeline.
3. **SSRF & Network Hardening**: Outbound reverse image candidate downloaders validate all target URLs to disallow RFC-1918 private IP ranges, loopback endpoints, and metadata services.
4. **API Armor**: Protected by Helmet HTTP security headers, CORS origin whitelisting, Multer MIME/magic-number validation, and rate limiting.

---

## ⚖️ Ethical Biometric Policy

> [!IMPORTANT]
> This system reports **biometric face matches** and **visual occurrence discovery** based on mathematical vector cosine similarity. It does **NOT** claim or guarantee legal identity certification ("Person Identified"). Similarity thresholds are empirical and may vary across lighting, orientation, and resolution.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more details.

---

<div align="center">

**Built with precision for HH Goa 2026 Shortlisting Task 3.**

</div>
