import { motion } from "framer-motion";
import type { RiskLevel } from "@/lib/forensiq/types";
import { cn } from "@/lib/utils";

interface Props {
  value: number; // 0–100
  level: RiskLevel;
}

export function ConfidenceMeter({ value, level }: Props) {
  const color =
    level === "low"
      ? "bg-accent"
      : level === "medium"
        ? "bg-warn"
        : "bg-danger";

  return (
    <div className="flex items-center gap-2">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
        Conf
      </div>
      <div className="relative h-1.5 w-28 overflow-hidden rounded-full bg-surface-elevated">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn("h-full", color)}
        />
        <div className="pointer-events-none absolute inset-0 shimmer opacity-40" />
      </div>
      <div className={cn("font-mono text-xs tabular-nums",
        level === "low" ? "text-accent" : level === "medium" ? "text-warn" : "text-danger")}>
        {value}%
      </div>
    </div>
  );
}
