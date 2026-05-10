import { Atom, Database, Cpu, Lock } from "lucide-react";

export function MetadataPanel() {
  return (
    <aside className="hidden h-full flex-col gap-4 overflow-y-auto border-l border-border bg-surface/40 p-4 xl:flex">
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          Investigation metadata
        </div>
        <div className="mt-2 space-y-1.5">
          <Row label="Engine"    value="Llama 3.1 70B" />
          <Row label="RAG Index" value="pgvector · 1536d" />
          <Row label="Chain"     value="Solana · Devnet" />
          <Row label="Voice"     value="ElevenLabs · v2" />
        </div>
      </div>

      {/* Quantum meter */}
      <div className="rounded-lg border border-warn/30 bg-warn/5 p-3">
        <div className="flex items-center gap-2">
          <Atom className="h-4 w-4 text-warn" />
          <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-warn">
            Quantum exposure
          </span>
        </div>
        {/* radial-ish meter */}
        <div className="mt-3 flex items-center gap-3">
          <div className="relative h-16 w-16">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="var(--warn)"
                strokeWidth="2.5"
                strokeDasharray="68, 100"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-warn">
              68%
            </div>
          </div>
          <div className="text-[11px] leading-snug text-text-dim">
            Public-key signatures exposed across recent scans place the average wallet in the
            <span className="text-warn"> Tier-1 </span>
            quantum risk class.
          </div>
        </div>
      </div>

      {/* Sources */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          Connected sources
        </div>
        <div className="mt-2 space-y-1.5">
          <Source Icon={Database} name="Helius RPC"        status="online" />
          <Source Icon={Cpu}      name="Groq · Llama 3.1"  status="online" />
          <Source Icon={Lock}     name="Solana Memo Prog." status="online" />
        </div>
      </div>

      {/* Mini chart placeholder */}
      <div className="rounded-lg border border-border bg-bg/60 p-3">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          On-chain activity (7d)
        </div>
        <svg viewBox="0 0 120 40" className="mt-2 h-12 w-full">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,30 L15,22 L30,26 L45,14 L60,18 L75,8 L90,12 L105,4 L120,10 L120,40 L0,40 Z" fill="url(#g)" />
          <path d="M0,30 L15,22 L30,26 L45,14 L60,18 L75,8 L90,12 L105,4 L120,10" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        </svg>
        <div className="mt-1 flex justify-between font-mono text-[9px] text-text-dim">
          <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded border border-border bg-bg/60 px-2.5 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">{label}</span>
      <span className="font-mono text-[11px] text-text">{value}</span>
    </div>
  );
}

function Source({ Icon, name, status }: { Icon: typeof Database; name: string; status: "online" | "offline" }) {
  return (
    <div className="flex items-center justify-between rounded border border-border bg-bg/60 px-2.5 py-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-text-dim" />
        <span className="text-[11px] text-text">{name}</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-text-dim">
        <span className={`h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-accent" : "bg-muted"}`} />
        {status}
      </div>
    </div>
  );
}
