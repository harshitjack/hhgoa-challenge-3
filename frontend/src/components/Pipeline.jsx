import React from "react";
import PipelineStep from "./PipelineStep";

export default function Pipeline({ steps, status }) {
  const stepDefinitions = [
    {
      number: "01",
      title: "FACE DETECTION",
      subtitle: "Locate facial bounding coordinates",
      status: steps?.faceDetection || "PENDING",
    },
    {
      number: "02",
      title: "FACE EMBEDDING",
      subtitle: "InsightFace 512-d feature vector extraction",
      status: steps?.embedding || "PENDING",
    },
    {
      number: "03",
      title: "REVERSE SEARCH",
      subtitle: "Google Lens visual index discovery via SerpAPI",
      status: steps?.webSearch || "PENDING",
    },
    {
      number: "04",
      title: "MATCH ANALYSIS",
      subtitle: "Cosine similarity against candidate embeddings",
      status: steps?.matchAnalysis || "PENDING",
    },
    {
      number: "05",
      title: "CONTENT HASH",
      subtitle: "Cryptographic SHA-256 fingerprint generation",
      status: steps?.hash || "PENDING",
    },
    {
      number: "06",
      title: "BLOCKCHAIN",
      subtitle: "Polygon Amoy testnet registration & confirmation",
      status: steps?.blockchain || "PENDING",
    },
    {
      number: "07",
      title: "RE-VERIFY",
      subtitle: "On-chain state read to verify tamper resistance",
      status: steps?.reverification || "PENDING",
    },
  ];

  return (
    <div id="pipeline" className="border border-white/20 bg-[#0d0d12] p-6">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff66]">//</span>
          <span className="font-bold tracking-widest text-white uppercase">
            Real Verification Pipeline Sequence
          </span>
        </div>
        <div className="text-zinc-500 text-[11px]">STATUS: {status}</div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {stepDefinitions.map((step, idx) => (
          <PipelineStep
            key={step.number}
            index={idx}
            number={step.number}
            title={step.title}
            subtitle={step.subtitle}
            status={step.status}
          />
        ))}
      </div>
    </div>
  );
}
