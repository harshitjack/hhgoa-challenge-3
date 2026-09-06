import React, { useState } from "react";
import { motion } from "framer-motion";
import { Hash, Copy, Check, ArrowDown, Shield } from "lucide-react";

export default function ContentFingerprint({ contentHash }) {
  const [copied, setCopied] = useState(false);

  if (!contentHash) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(contentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/20 bg-[#0d0d12] p-6 font-mono">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-[#00ff66]" />
          <span className="font-bold tracking-widest text-white uppercase">
            04 // SHA-256 Content Fingerprint
          </span>
        </div>
        <div className="text-zinc-500 text-[11px]">ALGORITHM: SHA-256 (BYTES32)</div>
      </div>

      {/* Conceptual Dataflow Diagram */}
      <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center text-xs">
        <div className="border border-white/20 bg-white/5 px-4 py-2 text-zinc-300 font-semibold tracking-wider">
          VERIFIED SOURCE CONTENT
        </div>
        <ArrowDown className="h-4 w-4 text-[#00ff66] animate-bounce" />
        <div className="border border-[#00ff66]/40 bg-[#00ff66]/10 px-4 py-2 font-bold text-[#00ff66]">
          NODE CRYPTO // SHA-256 ENGINE
        </div>
        <ArrowDown className="h-4 w-4 text-[#00ff66] animate-bounce" />
        <div className="border border-white/20 bg-white/5 px-4 py-2 text-zinc-300 font-semibold tracking-wider">
          IMMUTABLE FINGERPRINT (BYTES32)
        </div>
      </div>

      {/* Cryptographic Hash Box */}
      <div className="relative border border-[#00ff66]/30 bg-black p-4">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-[#00ff66]" />
            <span>EXACT 256-BIT DIGEST:</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 border border-white/20 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 hover:border-[#00ff66] hover:text-[#00ff66] transition"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#00ff66]" />
                <span className="text-[#00ff66]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>COPY HASH</span>
              </>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="break-all font-mono text-sm sm:text-base font-bold tracking-wider text-[#00ff66]"
        >
          {contentHash}
        </motion.div>
      </div>

      {/* Security Context Callout */}
      <div className="mt-4 border-l-2 border-[#00ff66] bg-white/5 p-3 text-[11px] text-zinc-400">
        <p className="leading-relaxed">
          <span className="text-white font-semibold">Decentralized Integrity Guarantee:</span> Any modification,
          single-bit corruption, or adversarial tampering with the registered content yields a completely distinct
          fingerprint, preventing undetectable unauthorized modifications.
        </p>
      </div>
    </div>
  );
}
