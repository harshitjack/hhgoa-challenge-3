import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070709] py-12 font-mono text-xs text-zinc-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Logo & Tagline */}
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#00ff66]" />
              <span className="font-display font-bold tracking-widest text-white text-base">
                TRACE <span className="text-[#00ff66]">/</span> ID
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-wider text-zinc-400">
              FIND THE TRACE. VERIFY THE PROOF.
            </p>
          </div>

          {/* Hackathon Specs */}
          <div className="grid grid-cols-2 gap-8 text-[11px] sm:grid-cols-3">
            <div>
              <span className="block text-zinc-600">LOCATION</span>
              <span className="text-zinc-300">GOA / INDIA</span>
              <span className="block text-[9px] text-[#f59e0b]">15.4989° N, 73.8278° E</span>
            </div>

            <div>
              <span className="block text-zinc-600">SELECTION</span>
              <span className="text-zinc-300">HH GOA 2026</span>
              <span className="block text-[9px] text-[#00ff66]">TASK 03 COMPLETED</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="block text-zinc-600">CHAIN</span>
              <span className="text-zinc-300">POLYGON AMOY</span>
              <span className="block text-[9px] text-zinc-500">CHAIN ID 80002</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 border-t border-white/5 pt-6 text-[10px] text-zinc-600">
          Built for Hacker House Goa 2026 Candidate Evaluation. All biometric similarity comparisons are computed
          purely for cosine vector proximity and do not establish a person's legal identity. Biometric images are
          unlinked from disk immediately upon pipeline execution.
        </div>
      </div>
    </footer>
  );
}
