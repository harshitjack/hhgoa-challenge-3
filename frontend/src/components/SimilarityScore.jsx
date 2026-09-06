import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { formatSimilarity } from "../utils/format";

export default function SimilarityScore({ similarity, threshold = 0.7, matched }) {
  const percentage = similarity ? Math.round((similarity <= 1.0 ? similarity * 100 : similarity) * 10) / 10 : 0;
  const isMatch = matched || percentage >= threshold * 100;

  return (
    <div className="border border-white/10 bg-[#0d0d12] p-5 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <span className="text-zinc-400">METRIC // COSINE SIMILARITY</span>
        <span className="text-zinc-500">THRESHOLD: {threshold.toFixed(2)}</span>
      </div>

      {/* Main Animated Score Counter */}
      <div className="my-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-zinc-500">
          FACE SIMILARITY
        </div>
        <div className="mt-1 flex items-baseline justify-center gap-1">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className={`font-display text-5xl sm:text-6xl font-black tracking-tight ${
              isMatch ? "text-[#00ff66] drop-shadow-[0_0_25px_rgba(0,255,102,0.3)]" : "text-[#f59e0b]"
            }`}
          >
            {percentage.toFixed(1)}
          </motion.span>
          <span className="font-display text-2xl font-bold text-zinc-400">%</span>
        </div>

        {/* Progress gauge bar */}
        <div className="mx-auto mt-4 h-1.5 w-full max-w-xs overflow-hidden bg-white/10">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${isMatch ? "bg-[#00ff66]" : "bg-[#f59e0b]"}`}
          />
        </div>
      </div>

      {/* Match Confirmation Banner */}
      <div
        className={`flex items-center justify-center gap-2 border p-3 text-xs font-bold uppercase tracking-wider ${
          isMatch
            ? "border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]"
            : "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]"
        }`}
      >
        {isMatch ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>FACE MATCH CONFIRMED</span>
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4" />
            <span>NO MATCH // BELOW THRESHOLD</span>
          </>
        )}
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-3 text-center text-[10px] text-zinc-500">
        * SYSTEM REPORTS <span className="text-white font-semibold">FACE MATCH</span> BASED ON VECTOR SIMILARITY ONLY. IT DOES NOT DECLARE OR ESTABLISH A PERSON'S IDENTITY.
      </div>
    </div>
  );
}
