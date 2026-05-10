import { Atom, ShieldAlert } from "lucide-react";
import type { QuantumRisk } from "@/lib/forensiq/types";
import { cn } from "@/lib/utils";

function normalizeQuantumRisk(raw: any): QuantumRisk {
  if (!raw) {
    return { isAtRisk: false, exposedPublicKeyCount: 0, recommendation: 'No quantum risk data available.' };
  }
  if (typeof raw === 'number') {
    return {
      isAtRisk: raw > 10,
      exposedPublicKeyCount: raw,
      recommendation: raw > 10
        ? 'Migrate funds to a fresh wallet that has never signed a transaction.'
        : 'Quantum risk is currently low for this wallet.',
    };
  }
  return {
    isAtRisk: raw.isAtRisk ?? false,
    exposedPublicKeyCount: raw.exposedPublicKeyCount ?? 0,
    recommendation: raw.recommendation ?? 'No recommendation available.',
  };
}

export function QuantumRiskPanel({ risk }: { risk: any }) {
  const normalized = normalizeQuantumRisk(risk);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border p-4",
        normalized.isAtRisk
          ? "border-warn/40 bg-warn/5"
          : "border-border bg-surface",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border",
            normalized.isAtRisk
              ? "border-warn/40 bg-warn/10 text-warn"
              : "border-border bg-surface-elevated text-text-dim",
          )}
        >
          {normalized.isAtRisk ? <ShieldAlert className="h-5 w-5" /> : <Atom className="h-5 w-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-text">
              Quantum Risk
            </span>
            <span
              className={cn(
                "rounded border px-1.5 py-px font-mono text-[9px] uppercase tracking-widest",
                normalized.isAtRisk ? "border-warn/40 text-warn" : "border-border text-text-dim",
              )}
            >
              {normalized.isAtRisk ? "Tier 1" : "Standard"}
            </span>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-text-dim">
            <span className="font-mono text-text">{normalized.exposedPublicKeyCount}</span> exposed public-key signatures recorded on-chain.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-text-dim">{normalized.recommendation}</p>
        </div>
      </div>
      {normalized.isAtRisk && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-warn/10 blur-2xl" />
      )}
    </div>
  );
}