import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  "› Connecting to Helius RPC...",
  "› Fetching wallet transaction history (limit 100)...",
  "› Building forensic signal vector...",
  "› Querying knowledge base via pgvector (cosine similarity)...",
  "› Cross-referencing known drainer signatures...",
  "› Computing quantum exposure surface...",
  "› Synthesizing forensic report via Llama 3.1 70B...",
  "› Hashing report and committing memo to Solana...",
];

export function InvestigationLoader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STAGES.length - 1)), 380);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-accent/25 bg-surface/60 p-4"
    >
      <div className="flex items-center gap-3">
        {/* radar */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-accent/40">
          <div className="absolute inset-0 rounded-full border border-accent/15" />
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          >
            <div className="mx-auto h-full w-1/2 origin-right bg-gradient-to-r from-transparent to-accent/40" />
          </motion.div>
          <div className="relative h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_var(--accent-glow)]" />
        </div>

        <div className="flex-1">
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Investigation in progress
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-text-dim cursor-blink">
            {STAGES[step]}
          </div>
        </div>

        {/* bars */}
        <div className="flex h-7 items-end gap-0.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-1 rounded-sm bg-accent"
              animate={{ height: ["20%", "100%", "40%", "85%", "30%"] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
              style={{ height: "30%" }}
            />
          ))}
        </div>
      </div>

      {/* terminal log */}
      <div className="mt-3 max-h-28 overflow-hidden rounded border border-border bg-bg/60 px-3 py-2 font-mono text-[10px] leading-relaxed text-text-dim">
        {STAGES.slice(0, step + 1).map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className={i === step ? "text-accent" : ""}
          >
            {s}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
