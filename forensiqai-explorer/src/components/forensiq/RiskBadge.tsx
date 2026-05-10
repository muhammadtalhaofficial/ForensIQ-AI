import type { RiskLevel } from "@/lib/forensiq/types";
import { cn } from "@/lib/utils";
import { AlertTriangle, ShieldCheck, ShieldAlert, Skull } from "lucide-react";

const meta: Record<RiskLevel, { label: string; cls: string; Icon: typeof ShieldCheck }> = {
  low:      { label: "LOW RISK",      cls: "risk-bg-low text-accent",        Icon: ShieldCheck },
  medium:   { label: "MEDIUM RISK",   cls: "risk-bg-medium text-warn",       Icon: AlertTriangle },
  high:     { label: "HIGH RISK",     cls: "risk-bg-high text-danger",       Icon: ShieldAlert },
  critical: { label: "CRITICAL",      cls: "risk-bg-critical text-danger glow-danger", Icon: Skull },
};

export function RiskBadge({ level, large = false }: { level: RiskLevel; large?: boolean }) {
  const { label, cls, Icon } = meta[level];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono uppercase tracking-[0.15em]",
        large ? "px-3 py-1.5 text-[11px]" : "px-2 py-1 text-[10px]",
        cls,
      )}
    >
      <Icon className={large ? "h-3.5 w-3.5" : "h-3 w-3"} strokeWidth={2.4} />
      {label}
    </div>
  );
}
