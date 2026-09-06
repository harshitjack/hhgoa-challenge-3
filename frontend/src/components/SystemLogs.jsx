import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Copy, Check } from "lucide-react";

export default function SystemLogs({ logs }) {
  const scrollRef = useRef(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const copyAllLogs = () => {
    const text = logs.map((l) => `[${l.time}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-white/20 bg-black p-4 font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-[#00ff66]" />
          <span className="font-semibold text-white">SYSTEM TELEMETRY CONSOLE</span>
          <span className="text-zinc-600">// TRACE-SYS-V1</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66] animate-pulse" />
          <span className="text-[10px] text-zinc-500">LIVE SOCKET</span>
          {logs.length > 0 && (
            <button
              onClick={copyAllLogs}
              className="flex items-center gap-1 border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-400 hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-[#00ff66]" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "COPIED" : "COPY"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Scroll Viewport */}
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto pr-2 space-y-1.5 font-mono text-[11px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">
            // TELEMETRY LOG IDLE. UPLOAD TARGET TO COMMENCE AUDIT PIPELINE.
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2"
              >
                <span className="text-zinc-500 select-none">[{log.time}]</span>
                <span
                  className={
                    log.type === "error"
                      ? "text-red-400 font-semibold"
                      : log.type === "success"
                      ? "text-[#00ff66]"
                      : log.type === "warning"
                      ? "text-[#f59e0b]"
                      : "text-zinc-300"
                  }
                >
                  &gt; {log.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-zinc-600">
        <span>BUFF: 512-D // DIGEST: SHA-256</span>
        <span>EVENTS: {logs.length}</span>
      </div>
    </div>
  );
}
