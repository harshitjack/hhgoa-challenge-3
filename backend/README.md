# HH Goa 2026 Shortlisting Task 3: Face Identification & Blockchain Verification Backend

A production-ready, asynchronous backend pipeline implementing face detection, biometric facial embedding, genuine reverse image discovery via Google Lens, independent candidate face extraction, cosine similarity verification, SHA-256 content fingerprinting, Polygon Amoy smart contract registration, and immutable on-chain re-verification.

---

## 1. System Architecture

```
                                [ CLIENT / FRONTEND ]
                                          |
                        (1) POST /api/verification (multipart/form-data)
                                          v
    +-------------------------------------------------------------------------------+
    |                         NODE.JS / EXPRESS API SERVER                          |
    |                                                                               |
    |  * Rate Limiter & Helmet & CORS                                               |
    |  * Multer validation (MIME types: JPG/JPEG/PNG/WEBP; Max: 10MB)               |
    |  * Asynchronous non-blocking queue orchestration                              |
    |  * Mongoose ODM (Tracking detailed status & step transitions)                 |
    +-------------------------------------------------------------------------------+
           |                                                      |
    (2) Dispatches Async Pipeline                                 | (Polling / Read)
           |                                                      v
           v                                    GET /api/verification/:id
    +--------------------------------+          GET /api/verification/:id/results
    |      PIPELINE ORCHESTRATOR     |          GET /api/verification/:id/blockchain
    +--------------------------------+          POST /api/verification/:id/verify
           |
           |-- (A) Detect Face & Generate Embedding (512-d)
           |   v
           |   +---------------------------------------------+
           |   |      PYTHON INSIGHTFACE MICROSERVICE        |
           |   |      (FastAPI + InsightFace FaceAnalysis)   |
           |   +---------------------------------------------+
           |
           |-- (B) Discover Genuine Occurrences (No Hardcoding)
           |   v
           |   +---------------------------------------------+
           |   |      SERPAPI GOOGLE LENS REVERSE SEARCH     |
           |   +---------------------------------------------+
           |
           |-- (C) Download & Independently Verify Candidates
           |   v
           |   +---------------------------------------------+
           |   |  Candidate Face Extraction & Normalization  |
           |   +---------------------------------------------+
           |
           |-- (D) Cosine Similarity Matching (Threshold >= 0.70)
           |   v
           |   +---------------------------------------------+
           |   |   Select Highest Valid Candidate Match      |
           |   |   (Strictly "Face match", never identity)   |
           |   +---------------------------------------------+
           |
           |-- (E) Cryptographic Fingerprinting
           |   v
           |   +---------------------------------------------+
           |   |  Node.js crypto: SHA-256 bytes32 Content    |
           |   +---------------------------------------------+
           |
           |-- (F) Blockchain Registration (Polygon Amoy)
           |   v
           |   +---------------------------------------------+
           |   |  ethers.js v6 -> VerificationRegistry.sol   |
           |   |  registerContent(bytes32, sourceUrl)        |
           |   |  * Await 1 block confirmation               |
           |   +---------------------------------------------+
           |
           \-- (G) On-chain Re-verification
               v
               +---------------------------------------------+
               |  verifyContent(bytes32) check against chain |
               |  Status -> COMPLETED                        |
               +---------------------------------------------+
```

---

## 2. Tech Stack

- **Primary API Server**: Node.js (v20+) & Express.js (JavaScript)
- **Database**: MongoDB & Mongoose
- **Biometric Face Service**: Python 3.10+ with InsightFace (`FaceAnalysis`), OpenCV, and FastAPI
- **Search Engine**: SerpAPI (Google Lens Engine) for authentic, non-hardcoded reverse image search
- **Smart Contracts & Web3**: Solidity `^0.8.24`, Hardhat, ethers.js v6
- **Blockchain Network**: Polygon Amoy Testnet (Chain ID `80002`)
- **Security & Utilities**: Multer, Helmet, CORS, express-rate-limit, Winston, UUID

---

## 3. Environment Variables

Create a `.env` file in `backend/` by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Node.js Express server port | `5000` |
| `NODE_ENV` | Application environment | `development` or `production` |
| `CLIENT_URL` | Allowed origin for CORS | `http://localhost:3000` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/hhgoa_verification` |
| `SERPAPI_KEY` | SerpAPI Key for Google Lens reverse search | `your_serpapi_key` |
| `FACE_SERVICE_URL` | Base URL of Python InsightFace microservice | `http://127.0.0.1:5001` |
| `FACE_MATCH_THRESHOLD` | Cosine similarity threshold (see model notes) | `0.70` |
| `POLYGON_RPC_URL` | Polygon Amoy JSON-RPC provider endpoint | `https://rpc-amoy.polygon.technology` |
| `PRIVATE_KEY` | Hex private key funded with Amoy POL tokens | `0x1234...` |
| `CONTRACT_ADDRESS` | Address of deployed `VerificationRegistry` | `0xabcd...` |

> [!NOTE]
> **Threshold Note:** The threshold (default `0.70`) is specific to InsightFace ArcFace/CosFace embeddings normalized under L2 norm. This threshold is not scientifically universal and should be empirically calibrated based on domain lighting, pose variation, and resolution.

---

## 4. Setup & Running Instructions

### Step 1: Install Node.js Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up & Run Python Face Service
Ensure Python 3.10+ is installed:
```bash
cd backend/face-service
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
The Python face service will initialize InsightFace `buffalo_s` (or `buffalo_l`) and listen on `http://127.0.0.1:5001`.

Verify health check:
```bash
curl http://127.0.0.1:5001/health
```

### Step 3: Deploy Smart Contract to Polygon Amoy
1. Ensure your `.env` contains `POLYGON_RPC_URL` and a funded `PRIVATE_KEY`. Get free testnet POL from the [Polygon Faucet](https://faucet.polygon.technology/).
2. Compile contracts:
   ```bash
   cd backend
   npm run compile:contract
   ```
3. Deploy to Amoy:
   ```bash
   npm run deploy:amoy
   ```
4. Copy the deployed contract address output into your `.env` as `CONTRACT_ADDRESS`.

### Step 4: Run Node.js API Server
```bash
cd backend
# Development with auto-reload:
npm run dev

# Production:
npm start
```

Server will run at `http://localhost:5000`.

---

## 5. API Reference & Contract

### 1. Upload Face Image & Start Verification
- **Endpoint**: `POST /api/verification`
- **Content-Type**: `multipart/form-data`
- **Body Parameter**: `image` (binary file: JPG, JPEG, PNG, or WEBP)
- **Response**: `202 Accepted`
```json
{
  "success": true,
  "verificationId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
}
```

### 2. Check Pipeline Status
- **Endpoint**: `GET /api/verification/:id`
- **Response**: `200 OK`
```json
{
  "verificationId": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "MATCH_ANALYSIS",
  "steps": {
    "faceDetection": "COMPLETED",
    "embedding": "COMPLETED",
    "webSearch": "COMPLETED",
    "matchAnalysis": "PROCESSING",
    "hash": "PENDING",
    "blockchain": "PENDING",
    "reverification": "PENDING"
  },
  "error": null,
  "createdAt": "2026-09-05T08:00:00.000Z",
  "updatedAt": "2026-09-05T08:00:05.000Z"
}
```

**Supported Statuses**:
- `UPLOADED`: Image validated and saved.
- `FACE_DETECTION`: Verifying presence of facial structure.
- `EMBEDDING`: Extracting 512-d normalized biometric vector.
- `WEB_SEARCH`: Querying Google Lens reverse image database.
- `MATCH_ANALYSIS`: Downloading candidates and computing cosine similarity.
- `HASHING`: Generating SHA-256 fingerprint of verified match.
- `BLOCKCHAIN`: Broadcasting transaction to Polygon Amoy.
- `REVERIFICATION`: Verifying on-chain state matches current hash.
- `COMPLETED`: Pipeline succeeded with confirmed match and on-chain record.
- `NO_FACE`: No face detected in uploaded image.
- `NO_MATCH`: No candidate passed the similarity threshold.
- `FAILED`: Pipeline interrupted due to external error.

### 3. Retrieve Verification Results
- **Endpoint**: `GET /api/verification/:id/results`
- **Response**: `200 OK`
```json
{
  "matched": true,
  "similarity": 0.824,
  "candidate": {
    "title": "Public Profile / Post",
    "url": "https://instagram.com/p/sample",
    "source": "instagram.com",
    "imageUrl": "https://instagram.com/sample.jpg"
  },
  "contentHash": "0xa1b2c3d4e5f6...32bytes",
  "status": "COMPLETED"
}
```

> [!IMPORTANT]
> This system reports **Face match**, NOT "Person identified". Biometric similarity does not imply verified legal identity.

### 4. Inspect Blockchain Registration
- **Endpoint**: `GET /api/verification/:id/blockchain`
- **Response**: `200 OK`
```json
{
  "network": "Polygon Amoy",
  "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "transactionHash": "0x89abcdef0123...64hex",
  "blockNumber": 1284560,
  "contentHash": "0xa1b2c3d4e5f6...32bytes",
  "status": "CONFIRMED"
}
```

### 5. On-Chain Re-verification
- **Endpoint**: `POST /api/verification/:id/verify`
- **Response**: `200 OK`
```json
{
  "verified": true,
  "currentHash": "0xa1b2c3d4e5f6...32bytes",
  "onChainHash": "0xa1b2c3d4e5f6...32bytes"
}
```
Or in case of tampering / missing record:
```json
{
  "verified": false,
  "reason": "HASH_MISMATCH"
}
```

---

## 6. Testing

### Run Smart Contract Unit Tests
Tests contract deployment, event emission, duplicate prevention, and zero-hash guards:
```bash
npm run test:contract
```

### Run Node.js Automated Test Suite
Runs unit and integration tests across similarity math, SHA-256 hashing, API validation, and full pipeline mocks:
```bash
npm test
```

### Manual End-to-End Test Procedure
Run the included end-to-end testing script with a real test face image:
```bash
node scripts/test-e2e.js path/to/your-face.jpg
```
This script uploads the image, monitors the status stream, logs candidate discovery, displays transaction hashes, and calls the on-chain re-verification API.

---

## 7. Security & Biometric Privacy Measures

- **No Raw Biometrics on Chain**: The smart contract stores only SHA-256 hashes (`bytes32`) and source URLs. Raw face images and embedding vectors are never pushed to the blockchain.
- **Biometric File Cleanup**: Uploaded face images on disk are automatically unlinked upon pipeline completion or termination.
- **SSRF Prevention**: All candidate download URLs are validated to disallow private IP ranges, loopbacks, and dangerous protocols.
- **Request Safety**: Strict 10MB upload limit, MIME filtering, UUID-generated storage filenames, Helmet headers, CORS policies, and rate limiting.
