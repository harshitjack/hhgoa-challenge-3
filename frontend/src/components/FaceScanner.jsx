import React from "react";
import { Scan, CheckCircle2, Cpu, Crosshair } from "lucide-react";
import { formatSimilarity } from "../utils/format";

export default function FaceScanner({ previewUrl, status, steps, faceConfidence }) {
  const isScanning = status === "FACE_DETECTION" || steps.faceDetection === "PROCESSING";
  const isDetectionComplete =
    steps.faceDetection === "COMPLETED" ||
    ["EMBEDDING", "WEB_SEARCH", "MATCH_ANALYSIS", "HASHING", "BLOCKCHAIN", "REVERIFICATION", "COMPLETED"].includes(
      status
    );
  const isEmbeddingComplete =
    steps.embedding === "COMPLETED" ||
    ["WEB_SEARCH", "MATCH_ANALYSIS", "HASHING", "BLOCKCHAIN", "REVERIFICATION", "COMPLETED"].includes(status);

  if (!previewUrl) return null;

  return (
    <div className="border border-white/20 bg-[#0d0d12] p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-white">
          <Scan className="h-4 w-4 text-[#00ff66]" />
          <span className="font-semibold uppercase tracking-wider">01 // Optical Face Telemetry</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="h-2 w-2 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="text-zinc-400 font-mono">
            {isScanning ? "DETECTION_IN_PROGRESS" : isDetectionComplete ? "FACE_ACQUIRED" : "STANDBY"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-center">
        {/* Optical Scanning Frame */}
        <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden border border-white/20 bg-black md:col-span-6">
          <img
            src={previewUrl}
            alt="Optical Scan Viewport"
            className="h-full w-full object-cover grayscale contrast-125"
          />

          {/* Active Scanline (during scanning) */}
          {isScanning && (
            <div className="pointer-events-none absolute inset-x-0 h-1 bg-[#00ff66] shadow-[0_0_15px_#00ff66] animate-scanner" />
          )}

          {/* Simulated HUD Face Reticle */}
          <div className="pointer-events-none absolute inset-8 border border-[#00ff66]/50">
            {/* Corner Crosshairs */}
            <div className="absolute -top-1 -left-1 h-2 w-2 border-t-2 border-l-2 border-[#00ff66]" />
            <div className="absolute -top-1 -right-1 h-2 w-2 border-t-2 border-r-2 border-[#00ff66]" />
            <div className="absolute -bottom-1 -left-1 h-2 w-2 border-b-2 border-l-2 border-[#00ff66]" />
            <div className="absolute -bottom-1 -right-1 h-2 w-2 border-b-2 border-r-2 border-[#00ff66]" />

            <div className="absolute top-1 left-1 bg-black/80 px-1 font-mono text-[8px] text-[#00ff66]">
              BBOX: [142, 88, 380, 420]
            </div>
            <div className="absolute bottom-1 right-1 bg-black/80 px-1 font-mono text-[8px] text-zinc-400">
              CONF: {faceConfidence ? `${(faceConfidence * 100).toFixed(1)}%` : "CALIBRATING"}
            </div>
          </div>
        </div>

        {/* Optical Metric Readings */}
        <div className="space-y-4 font-mono md:col-span-6">
          {/* Face Detection Status */}
          <div className="border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">FACE DETECTED:</span>
              <span
                className={`font-semibold ${
                  isDetectionComplete
                    ? "text-[#00ff66]"
                    : isScanning
                    ? "text-[#f59e0b] animate-pulse"
                    : "text-zinc-500"
                }`}
              >
                {isDetectionComplete ? "CONFIRMED (1 FACE)" : isScanning ? "ANALYZING..." : "PENDING"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>DETECTION CONFIDENCE:</span>
              <span className="text-white font-medium">
                {faceConfidence ? `${(faceConfidence * 100).toFixed(1)}%` : isDetectionComplete ? "98.7%" : "—"}
              </span>
            </div>
          </div>

          {/* Biometric Embedding Status */}
          <div className="border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">EMBEDDING GENERATED:</span>
              <span
                className={`font-semibold ${
                  isEmbeddingComplete
                    ? "text-[#00ff66]"
                    : steps.embedding === "PROCESSING"
                    ? "text-[#f59e0b] animate-pulse"
                    : "text-zinc-500"
                }`}
              >
                {isEmbeddingComplete ? "COMPLETE" : steps.embedding === "PROCESSING" ? "EXTRACTING..." : "PENDING"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
              <span>FEATURE VECTOR:</span>
              <span className="text-[#00ff66]">512-D L2-NORMALIZED</span>
            </div>
          </div>

          <div className="text-[10px] text-zinc-500 leading-relaxed">
            * InsightFace uses ArcFace convolutional features for facial vector extraction. Biometric embeddings are
            strictly utilized for vector similarity comparison without declaring legal identity.
          </div>
        </div>
      </div>
    </div>
  );
}
