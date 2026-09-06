import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Network, Database, Shield, Box, Code, Search, Layers } from "lucide-react";

export default function Architecture() {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    {
      id: "react",
      title: "React / Vite UI",
      desc: "Client dashboard with Framer Motion, telemetry polling, and live on-chain re-verification.",
      icon: Code,
      accent: "#00ff66",
    },
    {
      id: "node",
      title: "Node / Express API",
      desc: "Main orchestrator handling Multer validation, async pipeline execution, and Mongoose tracking.",
      icon: Server,
      accent: "#f59e0b",
    },
    {
      id: "python",
      title: "Python Microservice",
      desc: "High-performance FastAPI service managing ONNX Runtime inference.",
      icon: Cpu,
      accent: "#00ff66",
    },
    {
      id: "insightface",
      title: "InsightFace Engine",
      desc: "ArcFace convolutional deep model extracting 512-dimensional normalized biometric vectors.",
      icon: Database,
      accent: "#f59e0b",
    },
    {
      id: "search",
      title: "Google Lens Search",
      desc: "SerpAPI authentic reverse search extracting web/social candidate URLs without hardcoding.",
      icon: Search,
      accent: "#00ff66",
    },
    {
      id: "similarity",
      title: "Cosine Similarity",
      desc: "Independent candidate face vector extraction and cosine metric comparison against 0.70 threshold.",
      icon: Shield,
      accent: "#f59e0b",
    },
    {
      id: "sha256",
      title: "SHA-256 Fingerprint",
      desc: "Deterministic 256-bit cryptographic digest formatted as bytes32. Zero raw biometric data stored.",
      icon: Box,
      accent: "#00ff66",
    },
    {
      id: "contract",
      title: "VerificationRegistry.sol",
      desc: "Solidity 0.8.24 smart contract storing immutable content hashes, source URLs, and timestamps.",
      icon: Layers,
      accent: "#f59e0b",
    },
    {
      id: "polygon",
      title: "Polygon Amoy Testnet",
      desc: "EVM consensus layer ensuring decentralized timestamping and tamper-evident proof (Chain ID 80002).",
      icon: Network,
      accent: "#00ff66",
    },
  ];

  return (
    <section id="architecture" className="border-b border-white/10 py-16 bg-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="font-mono text-xs text-[#00ff66] uppercase tracking-widest">
            // END-TO-END PIPELINE TOPOLOGY
          </div>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight text-white">
            TECHNICAL ARCHITECTURE
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-400">
            Hover over any subsystem node to inspect its specific technical responsibility.
          </p>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node, idx) => {
            const IconComponent = node.icon;
            const isSelected = activeNode === node.id;

            return (
              <motion.div
                key={node.id}
                onMouseEnter={() => setActiveNode(node.id)}
                onMouseLeave={() => setActiveNode(null)}
                whileHover={{ scale: 1.02 }}
                className={`group relative cursor-pointer border p-5 font-mono transition duration-200 ${
                  isSelected
                    ? "border-[#00ff66] bg-[#00ff66]/10 shadow-[0_0_20px_rgba(0,255,102,0.15)]"
                    : "border-white/10 bg-[#0d0d12] hover:border-white/30"
                }`}
              >
                {/* Step index pill */}
                <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-3">
                  <span>STAGE 0{idx + 1}</span>
                  <span className="text-zinc-600 font-mono">// ACTIVE</span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center border bg-black transition group-hover:scale-110"
                    style={{ borderColor: node.accent, color: node.accent }}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold text-white group-hover:text-[#00ff66] transition">
                      {node.title}
                    </h3>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-zinc-400 font-normal">
                  {node.desc}
                </p>

                {/* Subtle connector indicator */}
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2 text-[9px] text-zinc-500">
                  <span>INDEPENDENT VERIFICATION</span>
                  <span className="text-[#00ff66]">↓ SECURE PIPELINE</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
