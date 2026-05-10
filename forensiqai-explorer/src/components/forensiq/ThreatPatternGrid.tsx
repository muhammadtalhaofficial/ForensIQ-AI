import type { ForensicPattern } from "@/lib/forensiq/types";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThreatPatternGrid({ patterns }: { patterns: ForensicPattern[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
      {patterns.map((p) => (
        <div
          key={p.name}
          className={cn(
            "group relative flex items-center gap-2 rounded-md border px-2.5 py-2 text-[11px] transition-all",
            p.detected
              ? "border-danger/40 bg-danger/5 text-danger"
              : "border-border bg-surface text-text-dim hover:border-accent/30",
          )}
        >
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
              p.detected ? "border-danger/50 bg-danger/15" : "border-accent/30 bg-accent/5",
            )}
          >
            {p.detected ? (
              <X className="h-2.5 w-2.5 text-danger" strokeWidth={3} />
            ) : (
              <Check className="h-2.5 w-2.5 text-accent" strokeWidth={3} />
            )}
          </span>
          <div className="min-w-0">
            <div className="truncate font-mono text-[10px] uppercase tracking-[0.1em]">
              {p.name}
            </div>
            {p.detail && (
              <div className="truncate text-[9px] text-text-dim/80">{p.detail}</div>
            )}
          </div>
          {p.detected && (
            <div className="pointer-events-none absolute inset-0 rounded-md shadow-[0_0_14px_-4px] shadow-danger/40" />
          )}
        </div>
      ))}
    </div>
  );
}
