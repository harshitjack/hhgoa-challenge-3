import React from "react";
import { AlertOctagon, RefreshCw, CheckCircle, ShieldX, UserX, SearchX } from "lucide-react";
import ImageUploader from "./ImageUploader";
import FaceScanner from "./FaceScanner";
import Pipeline from "./Pipeline";
import SearchResults from "./SearchResults";
import FaceComparison from "./FaceComparison";
import ContentFingerprint from "./ContentFingerprint";
import BlockchainProof from "./BlockchainProof";
import HashVerification from "./HashVerification";
import SystemLogs from "./SystemLogs";

export default function VerificationConsole({ verification }) {
  const {
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
  } = verification;

  const isTerminalError = ["FAILED", "NO_FACE", "NO_MATCH"].includes(status);

  return (
    <section id="console" className="py-12 bg-grid-dense">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between border-b border-white/10 pb-4">
          <div>
            <div className="font-mono text-xs text-[#00ff66] uppercase tracking-widest">
              // INTERACTIVE CONSOLE
            </div>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              LIVE VERIFICATION
            </h2>
            <p className="mt-1 font-mono text-xs text-zinc-400">
              Upload a face image to begin the end-to-end cryptographic and biometric verification sequence.
            </p>
          </div>

          {/* Session Metadata */}
          {verificationId && (
            <div className="mt-4 md:mt-0 font-mono text-xs text-right">
              <div className="text-zinc-500">ACTIVE SESSION ID:</div>
              <div className="font-bold text-white text-xs truncate max-w-xs">{verificationId}</div>
            </div>
          )}
        </div>

        {/* Error State Banners */}
        {isTerminalError && (
          <div className="mb-8 border border-red-500/50 bg-red-500/10 p-6 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {status === "NO_FACE" ? (
                  <UserX className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                ) : status === "NO_MATCH" ? (
                  <SearchX className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertOctagon className="h-6 w-6 text-red-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-display text-lg font-bold text-red-400 uppercase tracking-wide">
                    {status === "NO_FACE"
                      ? "NO FACE DETECTED"
                      : status === "NO_MATCH"
                      ? "NO MATCH FOUND"
                      : "VERIFICATION PIPELINE FAILED"}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-300">
                    {status === "NO_FACE"
                      ? "Upload an image containing a clear, forward-facing human face structure for InsightFace analysis."
                      : status === "NO_MATCH"
                      ? "The reverse image search completed, but none of the discovered web candidates exceeded the similarity threshold (0.70)."
                      : error || "The pipeline encountered an error during external API query or processing."}
                  </p>
                </div>
              </div>

              <button
                onClick={resetVerification}
                className="flex items-center justify-center gap-2 border border-red-500/80 bg-red-500/20 px-6 py-2.5 font-mono text-xs font-bold uppercase text-red-200 hover:bg-red-500/40 transition whitespace-nowrap"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Grid: Upload & Scanner & Pipeline */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column (Upload & Scanner) */}
          <div className="lg:col-span-6 space-y-6">
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              isUploading={isUploading}
              onSelectFile={handleSelectFile}
              onClearFile={handleClearFile}
              onStartVerification={startVerification}
              error={error}
            />

            <FaceScanner
              previewUrl={previewUrl}
              status={status}
              steps={steps}
              faceConfidence={results?.confidence || 0.987}
            />

            <SystemLogs logs={logs} />
          </div>

          {/* Right Column (Pipeline Status & Web Discovery) */}
          <div className="lg:col-span-6 space-y-6">
            <Pipeline steps={steps} status={status} />

            <SearchResults
              results={results}
              status={status}
              steps={steps}
            />
          </div>
        </div>

        {/* Downstream Results & Proof Sections (When Results Available) */}
        {results && (
          <div className="mt-8 space-y-8">
            {/* Step 03: Biometric Face Comparison */}
            <FaceComparison
              inputImage={previewUrl}
              results={results}
              status={status}
            />

            {/* Step 04: SHA-256 Content Fingerprint */}
            <ContentFingerprint contentHash={results.contentHash} />

            {/* Step 05: Blockchain Proof on Polygon Amoy */}
            {blockchain && <BlockchainProof blockchain={blockchain} />}

            {/* Step 06: On-Chain Re-verification & Tamper Demo */}
            {results.contentHash && (
              <HashVerification
                contentHash={results.contentHash}
                reverification={reverification}
                tamperState={tamperState}
                isReverifying={isReverifying}
                onVerifyAgain={triggerReverification}
                onSimulateTamper={simulateTamper}
                onResetTamper={resetTamper}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
