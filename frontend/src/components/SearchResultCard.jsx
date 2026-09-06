import React from "react";
import { ExternalLink, Globe, CheckCircle2 } from "lucide-react";
import { formatSimilarity } from "../utils/format";

export default function SearchResultCard({ candidate, similarity, isBestMatch }) {
  if (!candidate) return null;

  return (
    <div
      className={`group relative border p-4 font-mono text-xs transition duration-200 ${
        isBestMatch
          ? "border-[#00ff66] bg-[#00ff66]/5 shadow-[0_0_20px_rgba(0,255,102,0.1)]"
          : "border-white/10 bg-[#0d0d12] hover:border-white/30 hover:bg-[#121218]"
      }`}
    >
      {/* Best Match Badge */}
      {isBestMatch && (
        <div className="absolute top-0 right-0 flex items-center gap-1 bg-[#00ff66] px-2 py-0.5 font-mono text-[9px] font-bold text-black uppercase tracking-wider">
          <CheckCircle2 className="h-3 w-3" />
          <span>VERIFIED MATCH</span>
        </div>
      )}

      <div className="flex gap-4">
        {/* Candidate Thumbnail */}
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-white/20 bg-black">
          {candidate.imageUrl || candidate.thumbnail ? (
            <img
              src={candidate.imageUrl || candidate.thumbnail}
              alt={candidate.title || "Discovered Match"}
              className="h-full w-full object-cover grayscale contrast-125 transition duration-300 group-hover:grayscale-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              <Globe className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <Globe className="h-3 w-3 text-zinc-400" />
            <span className="uppercase">{candidate.source || "Discovered Domain"}</span>
          </div>

          <h4 className="mt-1 line-clamp-2 font-display text-sm font-semibold text-white group-hover:text-[#00ff66]">
            {candidate.title || "Discovered Visual Match"}
          </h4>

          {/* Metric Bar */}
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-[11px]">
            <span className="text-zinc-500">FACE SIMILARITY:</span>
            <span
              className={`font-semibold ${
                similarity >= 0.7 ? "text-[#00ff66]" : "text-[#f59e0b]"
              }`}
            >
              {formatSimilarity(similarity)}
            </span>
          </div>
        </div>
      </div>

      {/* Target URL link */}
      {candidate.url && (
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
          <span className="truncate text-[10px] text-zinc-500 max-w-[200px]">
            {candidate.url}
          </span>
          <a
            href={candidate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[10px] text-[#00ff66] hover:underline"
          >
            <span>VIEW SOURCE</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
