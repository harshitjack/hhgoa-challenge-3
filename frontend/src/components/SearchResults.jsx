import React from "react";
import { Search, Loader2, Globe } from "lucide-react";
import SearchResultCard from "./SearchResultCard";

export default function SearchResults({ results, status, steps }) {
  const isSearching =
    status === "WEB_SEARCH" ||
    status === "MATCH_ANALYSIS" ||
    steps.webSearch === "PROCESSING" ||
    steps.matchAnalysis === "PROCESSING";

  const hasResult = results && results.candidate;

  return (
    <div className="border border-white/20 bg-[#0d0d12] p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-[#00ff66]" />
          <span className="font-bold tracking-widest text-white uppercase">
            02 // Web Discovery Telemetry
          </span>
        </div>
        <div className="text-zinc-500 text-[11px]">
          {isSearching ? "SEARCHING_INDEX" : hasResult ? "MATCH_DISCOVERED" : "IDLE"}
        </div>
      </div>

      {isSearching ? (
        /* Searching State Visual */
        <div className="py-8 text-center font-mono">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[#00ff66]/30 bg-[#00ff66]/10 text-[#00ff66]">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
          <h4 className="font-display text-base font-semibold text-white tracking-wide">
            SEARCHING WEB...
          </h4>
          <p className="mt-1 text-xs text-zinc-500">
            Querying Google Lens visual index via SerpAPI for authentic candidate occurrences.
          </p>

          <div className="mt-6 mx-auto max-w-sm border border-white/10 bg-black/60 p-3 text-left font-mono text-[10px] text-zinc-400 space-y-1">
            <div className="text-zinc-500">// SYSTEM LOG:</div>
            <div>&gt; reverse search initialized</div>
            <div>&gt; query image prepared</div>
            <div>&gt; searching visual index...</div>
            <div className="text-[#00ff66]">&gt; extracting web candidates...</div>
          </div>
        </div>
      ) : hasResult ? (
        /* Candidate Card Output */
        <div className="space-y-3">
          <div className="font-mono text-xs text-zinc-400">
            DISCOVERED CANDIDATE FROM REVERSE INDEX:
          </div>
          <SearchResultCard
            candidate={results.candidate}
            similarity={results.similarity}
            isBestMatch={results.matched}
          />
        </div>
      ) : (
        /* Empty / Awaiting Search */
        <div className="py-8 text-center font-mono text-xs text-zinc-500">
          <Globe className="mx-auto mb-2 h-8 w-8 text-zinc-600 stroke-[1.2]" />
          <p>// AWAITING PIPELINE TRIGGER TO DISCOVER WEB CANDIDATES</p>
        </div>
      )}
    </div>
  );
}
