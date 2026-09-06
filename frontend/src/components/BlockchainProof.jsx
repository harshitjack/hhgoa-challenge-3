import React from "react";
import { motion } from "framer-motion";
import { Layers, ExternalLink, CheckCircle2, ShieldCheck } from "lucide-react";
import { truncateHash, formatTimestamp } from "../utils/format";

export default function BlockchainProof({ blockchain }) {
  if (!blockchain || !blockchain.transactionHash) return null;

  const explorerUrl =
    blockchain.transactionHash && !blockchain.transactionHash.startsWith("mock")
      ? `https://amoy.polygonscan.com/tx/${blockchain.transactionHash}`
      : `https://amoy.polygonscan.com/`;

  const flowSteps = [
    { label: "CONTENT", desc: "Discovered URL" },
    { label: "SHA-256", desc: "bytes32 Digest" },
    { label: "SMART CONTRACT", desc: "VerificationRegistry" },
    { label: "POLYGON AMOY", desc: "Chain ID 80002" },
    { label: "TRANSACTION", desc: "Confirmed" },
  ];

  return (
    <div id="proof" className="border border-white/20 bg-[#0d0d12] p-6 font-mono">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#00ff66]" />
          <span className="font-bold tracking-widest text-white uppercase">
            05 // Anchored to Blockchain Proof
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#00ff66]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>ON-CHAIN CONFIRMED</span>
        </div>
      </div>

      {/* Visual Connected Line Flow */}
      <div className="mb-8 hidden md:flex items-center justify-between">
        {flowSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center text-center">
              <div className="border border-[#00ff66]/50 bg-[#00ff66]/10 px-3 py-1.5 text-[11px] font-bold text-[#00ff66]">
                {step.label}
              </div>
              <span className="mt-1 text-[9px] text-zinc-500">{step.desc}</span>
            </div>
            {idx < flowSteps.length - 1 && (
              <div className="relative flex-1 mx-2 h-0.5 bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="h-full w-12 bg-[#00ff66]"
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Grid of On-Chain Proof Parameters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Network */}
        <div className="border border-white/10 bg-black p-3.5">
          <div className="text-[10px] text-zinc-500">CONSENSUS NETWORK:</div>
          <div className="mt-1 font-bold text-white text-xs">
            {blockchain.network || "Polygon Amoy"}
          </div>
          <div className="text-[9px] text-zinc-500">CHAIN ID: 80002</div>
        </div>

        {/* Block Height */}
        <div className="border border-white/10 bg-black p-3.5">
          <div className="text-[10px] text-zinc-500">BLOCK NUMBER:</div>
          <div className="mt-1 font-bold text-[#00ff66] text-xs">
            {blockchain.blockNumber ? `#${blockchain.blockNumber}` : "CONFIRMED"}
          </div>
          <div className="text-[9px] text-zinc-500">IMMUTABLE ANCHOR</div>
        </div>

        {/* Contract Address */}
        <div className="border border-white/10 bg-black p-3.5">
          <div className="text-[10px] text-zinc-500">SMART CONTRACT:</div>
          <div className="mt-1 font-bold text-white text-xs truncate" title={blockchain.contractAddress}>
            {truncateHash(blockchain.contractAddress, 8, 6)}
          </div>
          <div className="text-[9px] text-zinc-500">VERIFICATION REGISTRY</div>
        </div>

        {/* Timestamp */}
        <div className="border border-white/10 bg-black p-3.5">
          <div className="text-[10px] text-zinc-500">BLOCK TIMESTAMP:</div>
          <div className="mt-1 font-bold text-white text-xs truncate">
            {formatTimestamp(blockchain.timestamp || Date.now())}
          </div>
          <div className="text-[9px] text-zinc-500">UTC SYNCHRONIZED</div>
        </div>
      </div>

      {/* Transaction Hash & PolygonScan Link */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-[#00ff66]/30 bg-black p-4 text-xs">
        <div>
          <span className="text-[10px] text-zinc-500">TRANSACTION HASH:</span>
          <div className="font-mono text-xs text-[#00ff66] break-all max-w-xl font-bold">
            {blockchain.transactionHash}
          </div>
        </div>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 border border-[#00ff66] bg-[#00ff66] px-4 py-2 font-mono text-xs font-bold uppercase text-black hover:bg-transparent hover:text-[#00ff66] transition"
        >
          <span>View on PolygonScan</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
