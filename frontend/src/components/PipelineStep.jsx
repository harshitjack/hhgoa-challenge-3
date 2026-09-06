import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, CircleDashed, AlertCircle, Clock } from "lucide-react";

export default function PipelineStep({ index, number, title, subtitle, status }) {
  const isComplete = status === "COMPLETED";
  const isProcessing = status === "PROCESSING";
  const isFailed = status === "FAILED";
  const isPending = status === "PENDING" || status === "SKIPPED";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`relative flex items-center justify-between border p-3.5 font-mono text-xs transition duration-200 ${
        isProcessing
          ? "border-[#00ff66] bg-[#00ff66]/5 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
          : isComplete
          ? "border-[#00ff66]/40 bg-[#0d0d12]"
          : isFailed
          ? "border-red-500/40 bg-red-500/5"
          : "border-white/10 bg-[#0d0d12]/60 text-zinc-500"
      }`}
    >
      {/* Left step index and title */}
      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-xs font-bold ${
            isProcessing
              ? "text-[#00ff66]"
              : isComplete
              ? "text-[#00ff66]/80"
              : isFailed
              ? "text-red-400"
              : "text-zinc-600"
          }`}
        >
          {number}
        </span>
        <div>
          <div
            className={`font-semibold tracking-wider ${
              isProcessing
                ? "text-white"
                : isComplete
                ? "text-zinc-200"
                : isFailed
                ? "text-red-300"
                : "text-zinc-400"
            }`}
          >
            {title}
          </div>
          {subtitle && (
            <div className="text-[10px] text-zinc-500">{subtitle}</div>
          )}
        </div>
      </div>

      {/* Right status badge */}
      <div className="flex items-center gap-2">
        {isProcessing && (
          <span className="flex items-center gap-1.5 font-semibold text-[#00ff66]">
            <CircleDashed className="h-3.5 w-3.5 animate-spin" />
            <span className="text-[10px] tracking-widest">PROCESSING</span>
          </span>
        )}
        {isComplete && (
          <span className="flex items-center gap-1.5 font-semibold text-[#00ff66]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-[10px] tracking-widest">COMPLETE</span>
          </span>
        )}
        {isFailed && (
          <span className="flex items-center gap-1.5 font-semibold text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="text-[10px] tracking-widest">FAILED</span>
          </span>
        )}
        {isPending && (
          <span className="flex items-center gap-1 text-zinc-600">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] tracking-widest">PENDING</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
