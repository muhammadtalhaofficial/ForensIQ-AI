import { Activity, AlertTriangle, Radio, TrendingUp } from "lucide-react";

const FEED = [
  { time: "12s", text: "Drainer cluster activated · 4 new victims", level: "high" as const },
  { time: "1m",  text: "New mixer staging address detected",         level: "med"  as const },
  { time: "3m",  text: "Inferno Drainer signature update committed", level: "low"  as const },
  { time: "8m",  text: "Bridge hop sequence flagged on Wormhole",    level: "med"  as const },
  { time: "14m", text: "1.2k SOL drained from compromised wallet",   level: "high" as const },
  { time: "22m", text: "Knowledge base re-indexed (12,481 docs)",    level: "low"  as const },
];

const dotCls: Record<"low" | "med" | "high", string> = {
  low:  "bg-accent",
  med:  "bg-warn",
  high: "bg-danger",
};

export function IntelligenceFeed() {
  return (
    <aside className="hidden h-full flex-col gap-4 overflow-y-auto border-r border-border bg-surface/40 p-4 lg:flex">
      {/* Threat metrics */}
      <div>
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          Network threat level
        </div>
        <div className="mt-2 rounded-lg border border-danger/30 bg-danger/5 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <span className="font-display text-sm font-bold uppercase tracking-[0.16em] text-danger">
              Elevated
            </span>
          </div>
          <div className="mt-2 flex items-end gap-1">
            {[40, 65, 35, 90, 55, 78, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-danger/40 to-danger"
                style={{ height: `${h * 0.45}px` }}
              />
            ))}
          </div>
          <div className="mt-1 font-mono text-[9px] text-text-dim">7d incident curve</div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-2">
        <MiniStat Icon={Activity}   label="Scans / 24h" value="3,412" tone="accent" />
        <MiniStat Icon={Radio}      label="Active feeds" value="14"   tone="accent" />
        <MiniStat Icon={TrendingUp} label="New threats"  value="+27"  tone="warn" />
        <MiniStat Icon={AlertTriangle} label="Critical"  value="6"    tone="danger" />
      </div>

      {/* Live feed */}
      <div className="flex-1 min-h-0">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
            Live intelligence
          </div>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        </div>
        <ul className="space-y-1.5">
          {FEED.map((f, i) => (
            <li
              key={i}
              className="rounded-md border border-border bg-bg/60 px-2.5 py-2 transition-colors hover:border-accent/30"
            >
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dotCls[f.level]}`} />
                <span className="font-mono text-[9px] uppercase tracking-widest text-text-dim">
                  {f.time} ago
                </span>
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-text-dim">{f.text}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function MiniStat({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: typeof Activity;
  label: string;
  value: string;
  tone: "accent" | "warn" | "danger";
}) {
  const cls =
    tone === "accent" ? "text-accent" : tone === "warn" ? "text-warn" : "text-danger";
  return (
    <div className="rounded-md border border-border bg-bg/60 p-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 font-mono text-base font-semibold tabular-nums ${cls}`}>
        {value}
      </div>
    </div>
  );
}
