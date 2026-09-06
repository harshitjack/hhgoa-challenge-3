import React, { useEffect, useState } from "react";
import { ShieldCheck, Activity, Terminal, Wifi, WifiOff } from "lucide-react";
import { api } from "../services/api";

export default function Navbar({ onRunVerification, onNavigate }) {
  const [backendStatus, setBackendStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const res = await api.checkHealth();
      if (mounted) {
        if (res && res.status === "ok") {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      }
    };
    check();
    const interval = setInterval(check, 10000); // refresh check every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070709]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo & Product Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center border border-[#00ff66]/40 bg-[#00ff66]/10 text-[#00ff66]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold tracking-widest text-white text-lg">
                TRACE <span className="text-[#00ff66]">/</span> ID
              </span>
              <span className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[#f59e0b] sm:inline-block">
                HH GOA 2026
              </span>
            </div>
            <p className="font-mono text-[9px] tracking-wider text-zinc-500">
              TASK 03 • 15.4989° N, 73.8278° E
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden items-center gap-8 font-mono text-xs tracking-wider text-zinc-400 md:flex">
          <button
            onClick={() => onNavigate("pipeline")}
            className="transition hover:text-[#00ff66] focus:outline-none"
          >
            // PIPELINE
          </button>
          <button
            onClick={() => onNavigate("proof")}
            className="transition hover:text-[#00ff66] focus:outline-none"
          >
            // PROOF
          </button>
          <button
            onClick={() => onNavigate("architecture")}
            className="transition hover:text-[#00ff66] focus:outline-none"
          >
            // ARCHITECTURE
          </button>
        </nav>

        {/* Right Metadata & Connection Status */}
        <div className="flex items-center gap-3">
          {/* Live Backend Connection Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 border border-white/10 bg-black/60 px-2.5 py-1 font-mono text-[10px]">
            {backendStatus === "online" ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
                <span className="text-[#00ff66]">BACKEND: ONLINE (PORT 5000)</span>
              </>
            ) : backendStatus === "checking" ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
                <span className="text-zinc-400">CONNECTING...</span>
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span className="text-red-400">BACKEND: OFFLINE</span>
              </>
            )}
          </div>

          <button
            onClick={onRunVerification}
            className="group relative inline-flex items-center gap-2 border border-[#00ff66] bg-[#00ff66]/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#00ff66] transition hover:bg-[#00ff66] hover:text-black focus:outline-none"
          >
            <Activity className="h-3.5 w-3.5 transition group-hover:rotate-45" />
            <span>Run Verification</span>
          </button>
        </div>
      </div>
    </header>
  );
}
