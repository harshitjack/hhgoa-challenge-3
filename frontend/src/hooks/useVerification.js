import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../services/api";
import { formatTimeOnly } from "../utils/format";
import confetti from "canvas-confetti";

const TERMINAL_STATUSES = ["COMPLETED", "FAILED", "NO_FACE", "NO_MATCH"];

export function useVerification() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [steps, setSteps] = useState({
    faceDetection: "PENDING",
    embedding: "PENDING",
    webSearch: "PENDING",
    matchAnalysis: "PENDING",
    hash: "PENDING",
    blockchain: "PENDING",
    reverification: "PENDING",
  });
  const [results, setResults] = useState(null);
  const [blockchain, setBlockchain] = useState(null);
  const [reverification, setReverification] = useState(null);
  const [tamperState, setTamperState] = useState({
    active: false,
    simulatedHash: null,
    tamperDetected: false,
  });
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReverifying, setIsReverifying] = useState(false);

  const pollTimerRef = useRef(null);
  const prevStatusRef = useRef("IDLE");

  const addLog = useCallback((message, type = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        time: formatTimeOnly(),
        message,
        type,
      },
    ]);
  }, []);

  // Handle local file selection and preview
  const handleSelectFile = useCallback((file) => {
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  }, []);

  const handleClearFile = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }, [previewUrl]);

  // Clean polling interval
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  // Start new verification
  const startVerification = useCallback(
    async (fileToUpload) => {
      const targetFile = fileToUpload || selectedFile;
      if (!targetFile) {
        setError("Please select an image file first.");
        return;
      }

      setIsUploading(true);
      setError(null);
      setResults(null);
      setBlockchain(null);
      setReverification(null);
      setTamperState({ active: false, simulatedHash: null, tamperDetected: false });
      setLogs([]);

      addLog("Initializing TRACE / ID verification session...");
      addLog(`File received: ${targetFile.name} (${(targetFile.size / 1024).toFixed(1)} KB)`);

      try {
        const response = await api.createVerification(targetFile);
        if (!response.success || !response.verificationId) {
          throw new Error(response.error || "Failed to initialize verification on server.");
        }

        const id = response.verificationId;
        setVerificationId(id);
        setStatus("UPLOADED");
        setIsUploading(false);
        addLog(`Verification ID created: ${id}`, "success");
        addLog("Asynchronous biometric pipeline engaged. Commencing telemetry polling...");

        // Polling loop (approx 1.5s)
        stopPolling();
        pollTimerRef.current = setInterval(async () => {
          try {
            const data = await api.getVerification(id);
            if (!data) return;

            setStatus(data.status);
            if (data.steps) {
              setSteps(data.steps);
            }

            // Log status transitions
            if (data.status !== prevStatusRef.current) {
              prevStatusRef.current = data.status;
              switch (data.status) {
                case "FACE_DETECTION":
                  addLog("Face detection module scanning bounding coordinates...");
                  break;
                case "EMBEDDING":
                  addLog("InsightFace model generating 512-dimensional normalized vector...", "success");
                  break;
                case "WEB_SEARCH":
                  addLog("Querying Google Lens visual index via SerpAPI...");
                  break;
                case "MATCH_ANALYSIS":
                  addLog("Retrieving discovered candidates and computing cosine similarity...");
                  break;
                case "HASHING":
                  addLog("Generating SHA-256 fingerprint of verified match payload...");
                  break;
                case "BLOCKCHAIN":
                  addLog("Broadcasting transaction to Polygon Amoy testnet...");
                  break;
                case "REVERIFICATION":
                  addLog("Validating immutable on-chain record consistency...");
                  break;
                case "COMPLETED":
                  addLog("Pipeline completed: Face match verified and anchored to chain.", "success");
                  break;
                case "NO_FACE":
                  addLog("Analysis concluded: No human face structure detected.", "error");
                  break;
                case "NO_MATCH":
                  addLog("Analysis concluded: No candidate passed similarity threshold.", "warning");
                  break;
                case "FAILED":
                  addLog(`Pipeline failed: ${data.error?.message || "Unknown error"}`, "error");
                  break;
                default:
                  break;
              }
            }

            // Terminal status reached
            if (TERMINAL_STATUSES.includes(data.status)) {
              stopPolling();

              if (data.status === "COMPLETED") {
                // Fetch final results & blockchain data
                try {
                  const [resData, bcData] = await Promise.all([
                    api.getResults(id),
                    api.getBlockchainProof(id),
                  ]);
                  setResults(resData);
                  setBlockchain(bcData);
                  addLog(`Content hash: ${resData.contentHash}`);
                  addLog(`Transaction confirmed: ${bcData.transactionHash}`);

                  // Fire celebratory confetti on verified completion
                  try {
                    confetti({
                      particleCount: 80,
                      spread: 60,
                      origin: { y: 0.7 },
                      colors: ["#00ff66", "#f59e0b", "#ffffff"],
                    });
                  } catch (_) {}
                } catch (fetchErr) {
                  addLog(`Error fetching result artifacts: ${fetchErr.message}`, "error");
                }
              } else if (data.error) {
                setError(data.error.message || `Pipeline ended with status: ${data.status}`);
              }
            }
          } catch (pollErr) {
            console.warn("Polling error:", pollErr);
          }
        }, 1500);
      } catch (err) {
        setIsUploading(false);
        const errMsg = err.response?.data?.error || err.message || "Failed to upload image.";
        setError(errMsg);
        setStatus("FAILED");
        addLog(`Upload error: ${errMsg}`, "error");
      }
    },
    [selectedFile, addLog, stopPolling]
  );

  // Trigger real on-chain re-verification
  const triggerReverification = useCallback(async () => {
    if (!verificationId) return;
    setIsReverifying(true);
    addLog("Reading immutable state from Polygon Amoy contract (POST /verify)...");

    try {
      const verifyRes = await api.verifyContent(verificationId);
      setReverification(verifyRes);
      if (verifyRes.verified) {
        addLog("On-chain re-verification confirmed: Hash matches blockchain state.", "success");
      } else {
        addLog(`On-chain re-verification mismatch: ${verifyRes.reason}`, "error");
      }
    } catch (err) {
      addLog(`Re-verification error: ${err.message}`, "error");
      setReverification({ verified: false, reason: err.message });
    } finally {
      setIsReverifying(false);
    }
  }, [verificationId, addLog]);

  // Optional simulation demonstration for tampering
  const simulateTamper = useCallback(() => {
    if (!results?.contentHash) return;
    const altered = results.contentHash.slice(0, -6) + "dead99";
    setTamperState({
      active: true,
      simulatedHash: altered,
      tamperDetected: true,
    });
    addLog("[DEMO / SIMULATION] Injected modified payload bitstream.", "warning");
    addLog(`[DEMO / SIMULATION] Tampered Hash: ${altered} ≠ Registered On-Chain Hash`, "error");
  }, [results, addLog]);

  const resetTamper = useCallback(() => {
    setTamperState({ active: false, simulatedHash: null, tamperDetected: false });
    addLog("[DEMO / SIMULATION] Restored authentic content fingerprint.", "info");
  }, [addLog]);

  const resetVerification = useCallback(() => {
    stopPolling();
    handleClearFile();
    setVerificationId(null);
    setStatus("IDLE");
    setSteps({
      faceDetection: "PENDING",
      embedding: "PENDING",
      webSearch: "PENDING",
      matchAnalysis: "PENDING",
      hash: "PENDING",
      blockchain: "PENDING",
      reverification: "PENDING",
    });
    setResults(null);
    setBlockchain(null);
    setReverification(null);
    setTamperState({ active: false, simulatedHash: null, tamperDetected: false });
    setLogs([]);
    setError(null);
  }, [stopPolling, handleClearFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [stopPolling, previewUrl]);

  return {
    selectedFile,
    previewUrl,
    verificationId,
    status,
    steps,
    results,
    blockchain,
    reverification,
    tamperState,
    logs,
    error,
    isUploading,
    isReverifying,
    handleSelectFile,
    handleClearFile,
    startVerification,
    triggerReverification,
    simulateTamper,
    resetTamper,
    resetVerification,
  };
}
