import React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, Scan, ShieldCheck, Sparkles } from "lucide-react";

export default function Hero({ onStartVerification, onViewPipeline, previewUrl }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-16 md:py-24 bg-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Oversized Editorial Typography */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            {/* Top Hacker House Tag */}
            <div className="mb-6 inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs tracking-wider text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
              <span>HH GOA 2026</span>
              <span className="text-zinc-600">/</span>
              <span className="text-[#f59e0b]">BIOMETRIC VERIFICATION & WEB3 PROOF</span>
            </div>

            {/* Oversized Kinetic Headline */}
            <h1 className="font-display text-5xl font-black uppercase tracking-tighter text-white sm:text-7xl lg:text-8xl leading-[0.92]">
              <span className="block">FIND THE</span>
              <span className="block text-zinc-400">TRACE.</span>
              <span className="block mt-2">VERIFY THE</span>
              <span className="block text-[#00ff66] drop-shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                PROOF.
              </span>
            </h1>

            {/* Subtitle & Concept */}
            <p className="mt-8 max-w-xl text-base text-zinc-400 sm:text-lg font-normal leading-relaxed">
              Discover matching web content from a face image, independently verify the match via{" "}
              <span className="text-white font-medium">InsightFace 512-d embeddings</span>, and
              anchor the discovered content to the{" "}
              <span className="text-[#00ff66] font-mono">Polygon Amoy</span> blockchain with immutable cryptographic fingerprints.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartVerification}
                className="group relative flex items-center gap-3 border border-[#00ff66] bg-[#00ff66] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:bg-transparent hover:text-[#00ff66] focus:outline-none"
              >
                <span>Start Verification</span>
                <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>

              <button
                onClick={onViewPipeline}
                className="flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-300 transition hover:border-white hover:text-white focus:outline-none"
              >
                <span>View Pipeline</span>
                <span className="text-zinc-500">// 07 STEPS</span>
              </button>
            </div>

            {/* Micro Metadata */}
            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 font-mono text-[11px] text-zinc-500">
              <div>
                <span className="block text-zinc-600">ENGINE</span>
                <span className="text-zinc-300">INSIGHTFACE</span>
              </div>
              <div>
                <span className="block text-zinc-600">DISCOVERY</span>
                <span className="text-zinc-300">GOOGLE LENS API</span>
              </div>
              <div>
                <span className="block text-zinc-600">CONSENSUS</span>
                <span className="text-[#00ff66]">AMOY TESTNET</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Abstract Face Scanning HUD or Live Image Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-sm rounded-none border border-white/20 bg-[#0d0d12] p-4 shadow-2xl">
              {/* Technical HUD Corner Markers */}
              <div className="absolute -top-1.5 -left-1.5 h-3 w-3 border-t-2 border-l-2 border-[#00ff66]" />
              <div className="absolute -top-1.5 -right-1.5 h-3 w-3 border-t-2 border-r-2 border-[#00ff66]" />
              <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 border-b-2 border-l-2 border-[#00ff66]" />
              <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 border-b-2 border-r-2 border-[#00ff66]" />

              {/* HUD Header */}
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 font-mono text-[10px] text-zinc-400">
                <div className="flex items-center gap-2">
                  <Scan className="h-3.5 w-3.5 text-[#00ff66]" />
                  <span>HUD // OPTICAL_VECTOR</span>
                </div>
                <span className="text-[#00ff66]">ACTIVE_SENSORS</span>
              </div>

              {/* Viewport Frame */}
              <div className="relative aspect-square w-full overflow-hidden border border-white/10 bg-black/80 flex items-center justify-center">
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Uploaded Target Face"
                      className="h-full w-full object-cover grayscale contrast-125"
                    />
                    {/* Active Scanline */}
                    <div className="pointer-events-none absolute inset-x-0 h-1 bg-[#00ff66] shadow-[0_0_12px_#00ff66] animate-scanner" />
                    {/* Bounding box overlay */}
                    <div className="pointer-events-none absolute inset-10 border border-[#00ff66]/60">
                      <div className="absolute top-0 right-0 bg-[#00ff66]/20 px-1 font-mono text-[8px] text-[#00ff66]">
                        FACE.TARGET_01
                      </div>
                    </div>
                  </>
                ) : (
                  // Abstract Face Scanning Wireframe
                  <div className="relative flex flex-col items-center justify-center p-6 text-center">
                    <svg
                      viewBox="0 0 200 200"
                      className="h-44 w-44 stroke-[#00ff66]/50 fill-none"
                    >
                      {/* Face contour geometry */}
                      <ellipse cx="100" cy="100" rx="60" ry="75" strokeWidth="1.2" strokeDasharray="3 3" />
                      <circle cx="75" cy="85" r="8" strokeWidth="1.5" />
                      <circle cx="125" cy="85" r="8" strokeWidth="1.5" />
                      <path d="M 90 125 Q 100 135 110 125" strokeWidth="1.5" />
                      <path d="M 100 85 L 100 110 L 95 115" strokeWidth="1.2" />
                      {/* Technical Grid lines */}
                      <line x1="20" y1="100" x2="180" y2="100" strokeWidth="0.5" stroke="rgba(255,255,255,0.2)" />
                      <line x1="100" y1="20" x2="100" y2="180" strokeWidth="0.5" stroke="rgba(255,255,255,0.2)" />
                    </svg>

                    {/* Scanline Sweep */}
                    <div className="pointer-events-none absolute inset-x-0 h-1 bg-[#00ff66]/80 shadow-[0_0_15px_#00ff66] animate-scanner" />

                    <div className="mt-2 font-mono text-xs uppercase tracking-wider text-zinc-400">
                      // AWAITING TARGET INPUT
                    </div>
                    <div className="font-mono text-[10px] text-zinc-600">
                      512-D ARC-VECTOR READY
                    </div>
                  </div>
                )}
              </div>

              {/* HUD Footer Telemetry */}
              <div className="mt-3 flex items-center justify-between font-mono text-[9px] text-zinc-500">
                <span>COORD: 15.4989° N, 73.8278° E</span>
                <span>FPS: 60 // DETECT: L-BUFFALO</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
