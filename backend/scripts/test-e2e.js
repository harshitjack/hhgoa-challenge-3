/**
 * Manual End-to-End Verification Pipeline Testing Script
 *
 * Usage:
 *   node scripts/test-e2e.js [path/to/test-face.jpg]
 *
 * This script will:
 * 1. Ensure backend API is alive (GET /health)
 * 2. Upload test face image (POST /api/verification)
 * 3. Poll pipeline status (GET /api/verification/:id) until terminal state
 * 4. Fetch final match results (GET /api/verification/:id/results)
 * 5. Check blockchain registration (GET /api/verification/:id/blockchain)
 * 6. Execute live on-chain re-verification (POST /api/verification/:id/verify)
 */

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_BASE = process.env.API_BASE_URL || "http://localhost:5000";

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runE2ETest() {
  console.log("================================================================================");
  console.log(" HH Goa 2026: Face Identification & Blockchain Verification End-to-End Test");
  console.log("================================================================================");
  console.log(`Target API Base: ${API_BASE}`);

  // 1. Health Check
  try {
    const health = await axios.get(`${API_BASE}/health`);
    console.log("✓ Backend is alive:", health.data);
  } catch (err) {
    console.error("✗ Backend is not responding at", API_BASE);
    console.error("  Please start the backend server: npm start");
    process.exit(1);
  }

  // 2. Prepare Sample Face Image
  const defaultImagePath = path.join(__dirname, "../tests/fixtures/sample_face.jpg");
  const targetImagePath = process.argv[2] || defaultImagePath;

  if (!fs.existsSync(targetImagePath)) {
    console.error(`✗ Image not found at: ${targetImagePath}`);
    console.log("  Please supply a path to a real JPG/PNG image, e.g.:");
    console.log("  node scripts/test-e2e.js ./my-face.jpg");
    process.exit(1);
  }

  console.log(`\n[Step 1] Uploading image: ${targetImagePath}...`);
  const form = new FormData();
  form.append("image", fs.createReadStream(targetImagePath));

  let verificationId;
  try {
    const uploadRes = await axios.post(`${API_BASE}/api/verification`, form, {
      headers: { ...form.getHeaders() },
    });
    verificationId = uploadRes.data.verificationId;
    console.log(`✓ Upload successful! Verification ID: ${verificationId}`);
  } catch (err) {
    console.error("✗ Upload failed:", err.response?.data || err.message);
    process.exit(1);
  }

  // 3. Poll Status
  console.log(`\n[Step 2] Polling verification progress...`);
  const terminalStatuses = ["COMPLETED", "FAILED", "NO_FACE", "NO_MATCH"];
  let finalStatus = "";

  for (let attempt = 1; attempt <= 30; attempt++) {
    await sleep(2000);
    try {
      const statusRes = await axios.get(`${API_BASE}/api/verification/${verificationId}`);
      const data = statusRes.data;
      console.log(
        `[Attempt ${attempt}] Status: ${data.status} | Steps: ${JSON.stringify(data.steps)}`
      );

      if (terminalStatuses.includes(data.status)) {
        finalStatus = data.status;
        break;
      }
    } catch (err) {
      console.warn(`Warning polling status: ${err.message}`);
    }
  }

  console.log(`\n[Step 3] Final Pipeline Status: ${finalStatus}`);

  // 4. Retrieve Match Results
  try {
    const resultsRes = await axios.get(`${API_BASE}/api/verification/${verificationId}/results`);
    console.log("\nMatch Results:", JSON.stringify(resultsRes.data, null, 2));
  } catch (err) {
    console.warn("Could not retrieve results:", err.response?.data || err.message);
  }

  // 5. Retrieve Blockchain Information
  try {
    const bcRes = await axios.get(`${API_BASE}/api/verification/${verificationId}/blockchain`);
    console.log("\nBlockchain Registration Info:", JSON.stringify(bcRes.data, null, 2));
  } catch (err) {
    console.warn("Could not retrieve blockchain info:", err.response?.data || err.message);
  }

  // 6. Test On-Chain Re-verification Endpoint
  if (finalStatus === "COMPLETED") {
    try {
      console.log(`\n[Step 4] Triggering On-Chain Re-verification (POST /api/verification/${verificationId}/verify)...`);
      const verifyRes = await axios.post(`${API_BASE}/api/verification/${verificationId}/verify`);
      console.log("On-Chain Verification Response:", JSON.stringify(verifyRes.data, null, 2));
    } catch (err) {
      console.error("Re-verification call failed:", err.response?.data || err.message);
    }
  }

  console.log("\n================================================================================");
  console.log(" Test execution completed.");
  console.log("================================================================================");
}

runE2ETest();
