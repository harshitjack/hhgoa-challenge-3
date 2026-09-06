import React from "react";
import { CheckCircle2, AlertTriangle, RefreshCw, Bug, ShieldAlert, ShieldCheck } from "lucide-react";

export default function HashVerification({
  contentHash,
  reverification,
  tamperState,
  isReverifying,
  onVerifyAgain,
  onSimulateTamper,
  onResetTamper,
}) {
  if (!contentHash) return null;

  const currentHashToDisplay = tamperState.active
    ? tamperState.simulatedHash
    : reverification?.currentHash || contentHash;

  const onChainHashToDisplay = reverification?.onChainHash || contentHash;

  const isTampered = tamperState.active || (reverification && reverification.verified === false);
  const isVerified = !isTampered && (reverification ? reverification.verified === true : true);

  return (
    <div className="border border-white/20 bg-[#0d0d12] p-6 font-mono">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#00ff66]" />
          <span className="font-bold tracking-widest text-white uppercase">
            06 // On-Chain Re-Verification & Tamper Audit
          </span>
        </div>
        <div className="text-zinc-500 text-[11px]">RPC: VERIFYCONTENT(BYTES32)</div>
      </div>

      {/* Tamper Simulation Banner if Active */}
      {tamperState.active && (
        <div className="mb-6 border border-[#f59e0b] bg-[#f59e0b]/10 p-3 text-xs text-[#f59e0b]">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            <span>[DEMO / SIMULATION MODE ACTIVE]</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-300">
            Simulating bitstream alteration in content buffer. Notice that the resulting hash no longer matches the
            immutable on-chain registry state.
          </p>
        </div>
      )}

      {/* Comparison Grid: Current Hash vs On-Chain Hash */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Current Content Hash */}
        <div className={`border p-4 bg-black ${isTampered ? "border-red-500/50" : "border-white/10"}`}>
          <div className="text-[10px] text-zinc-500">CURRENT COMPUTED CONTENT HASH:</div>
          <div
            className={`mt-2 break-all text-xs font-bold ${
              isTampered ? "text-red-400" : "text-[#00ff66]"
            }`}
          >
            {currentHashToDisplay}
          </div>
          <div className="mt-2 text-[9px] text-zinc-500">
            {tamperState.active ? "STATUS: CORRUPTED IN MEMORY" : "STATUS: SHA-256 CANDIDATE BUFFER"}
          </div>
        </div>

        {/* On-Chain Immutable Hash */}
        <div className="border border-white/10 bg-black p-4">
          <div className="text-[10px] text-zinc-500">ON-CHAIN STORED HASH (POLYGON AMOY):</div>
          <div className="mt-2 break-all text-xs font-bold text-white">
            {onChainHashToDisplay}
          </div>
          <div className="mt-2 text-[9px] text-zinc-500">
            STATUS: IMMUTABLE SMART CONTRACT STATE
          </div>
        </div>
      </div>

      {/* Final Verification State Banner */}
      <div className="mt-6">
        {isVerified ? (
          <div className="flex flex-col sm:flex-row items-center justify-between border border-[#00ff66]/50 bg-[#00ff66]/10 p-4 text-xs font-bold text-[#00ff66]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm tracking-wider">HASH MATCH // PROOF ON-CHAIN VERIFIED</span>
            </div>
            <div className="mt-2 sm:mt-0 font-mono text-[11px] text-zinc-300">
              TAMPER AUDIT: 0 VIOLATIONS
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between border border-red-500/60 bg-red-500/10 p-4 text-xs font-bold text-red-400">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-sm tracking-wider">
                CURRENT HASH ≠ ON-CHAIN HASH // TAMPER DETECTED
              </span>
            </div>
            <div className="mt-2 sm:mt-0 font-mono text-[11px] text-zinc-300">
              HASH MISMATCH REJECTED
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
        <button
          onClick={onVerifyAgain}
          disabled={isReverifying}
          className="flex items-center gap-2 border border-[#00ff66] bg-[#00ff66]/10 px-4 py-2 font-mono text-xs font-bold uppercase text-[#00ff66] hover:bg-[#00ff66] hover:text-black transition disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isReverifying ? "animate-spin" : ""}`} />
          <span>{isReverifying ? "READING RPC..." : "VERIFY AGAIN (LIVE ON-CHAIN)"}</span>
        </button>

        {!tamperState.active ? (
          <button
            onClick={onSimulateTamper}
            className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs font-semibold uppercase text-zinc-400 hover:border-[#f59e0b] hover:text-[#f59e0b] transition"
          >
            <Bug className="h-3.5 w-3.5" />
            <span>Simulate Content Tamper (Demo)</span>
          </button>
        ) : (
          <button
            onClick={onResetTamper}
            className="flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs font-semibold uppercase text-zinc-300 hover:text-white transition"
          >
            <span>Restore Authentic Hash</span>
          </button>
        )}
      </div>
    </div>
  );
}
