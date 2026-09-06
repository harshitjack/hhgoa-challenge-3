import React from "react";
import { ArrowLeftRight, UserCheck, ExternalLink } from "lucide-react";
import SimilarityScore from "./SimilarityScore";

export default function FaceComparison({ inputImage, results, status }) {
  if (!results || !results.candidate) return null;

  const candidate = results.candidate;

  return (
    <div className="border border-white/20 bg-[#0d0d12] p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-4 w-4 text-[#00ff66]" />
          <span className="font-bold tracking-widest text-white uppercase">
            03 // Biometric Vector Comparison
          </span>
        </div>
        <div className="text-zinc-500 text-[11px]">ALGORITHM: COSINE_NORM</div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
        {/* Input Face vs Discovered Face */}
        <div className="lg:col-span-7 grid grid-cols-2 gap-4">
          {/* Input Face */}
          <div className="border border-white/10 bg-black p-3 font-mono text-center">
            <div className="mb-2 text-[11px] font-semibold text-zinc-400">
              INPUT FACE
            </div>
            <div className="relative aspect-square w-full overflow-hidden border border-white/10 bg-zinc-900">
              {inputImage ? (
                <img
                  src={inputImage}
                  alt="Original Input Face"
                  className="h-full w-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600 text-xs">
                  [INPUT]
                </div>
              )}
              <div className="absolute bottom-1 left-1 bg-black/80 px-1 font-mono text-[9px] text-[#00ff66]">
                SOURCE: UPLOAD
              </div>
            </div>
            <div className="mt-2 text-[10px] text-zinc-500">512-D VECTOR GENERATED</div>
          </div>

          {/* Discovered Match Face */}
          <div className="border border-white/10 bg-black p-3 font-mono text-center">
            <div className="mb-2 text-[11px] font-semibold text-zinc-400">
              DISCOVERED FACE
            </div>
            <div className="relative aspect-square w-full overflow-hidden border border-[#00ff66]/40 bg-zinc-900">
              {candidate.imageUrl || candidate.thumbnail ? (
                <img
                  src={candidate.imageUrl || candidate.thumbnail}
                  alt="Discovered Match Face"
                  className="h-full w-full object-cover grayscale contrast-125"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-600 text-xs">
                  [MATCH]
                </div>
              )}
              <div className="absolute bottom-1 right-1 bg-black/80 px-1 font-mono text-[9px] text-[#00ff66]">
                MATCH: INDEPENDENT
              </div>
            </div>
            <div className="mt-2 truncate text-[10px] text-zinc-400">
              {candidate.source || "WEB SOURCE"}
            </div>
          </div>
        </div>

        {/* Similarity Score Card */}
        <div className="lg:col-span-5">
          <SimilarityScore
            similarity={results.similarity}
            threshold={0.7}
            matched={results.matched}
          />
        </div>
      </div>

      {/* Discovered Post Details Banner */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border border-white/10 bg-white/5 p-4 font-mono text-xs">
        <div>
          <span className="text-zinc-500 text-[10px]">DISCOVERED CONTENT:</span>
          <div className="font-semibold text-white">{candidate.title || "Matched Web Content"}</div>
          <div className="truncate text-zinc-400 text-[11px] max-w-md">{candidate.url}</div>
        </div>

        {candidate.url && (
          <a
            href={candidate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 sm:mt-0 flex items-center gap-1.5 border border-[#00ff66] bg-[#00ff66]/10 px-4 py-2 text-xs font-bold text-[#00ff66] hover:bg-[#00ff66] hover:text-black transition"
          >
            <span>OPEN SOURCE</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
