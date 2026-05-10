import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldAlert, ExternalLink } from "lucide-react";
import { RiskBadge } from "@/components/forensiq/RiskBadge";

export const Route = createFileRoute("/threats")({
  head: () => ({
    meta: [
      { title: "Threat Database · ForensiqAI" },
      { name: "description", content: "Browse the community-verified blacklist of malicious blockchain wallets." },
    ],
  }),
  component: ThreatsPage,
});

const THREATS = [
  { addr: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM", type: "Wallet Drainer", risk: "critical" as const, victims: 412, volume: "1,284 SOL", added: "2d ago" },
  { addr: "6dM4TqWyWJsbx4dvMq2qUL3vGvJv6V5Gq6Y5gZ5xZ5pN", type: "Phishing",       risk: "high"     as const, victims: 87,  volume: "318 SOL",   added: "5d ago" },
  { addr: "3yFwqXBfZY4G7Z9zQK8mXxLkH4nKp1ZcMv2QwR7jL5tA", type: "Mixer Usage",    risk: "high"     as const, victims: 0,   volume: "904 SOL",   added: "1w ago" },
  { addr: "8aJpLmRwqXBfZY4G7Z9zQK8mXxLkH4nKp1ZcMv2QwR7c", type: "Rug Pull",       risk: "critical" as const, victims: 1240,volume: "5,221 SOL", added: "1w ago" },
  { addr: "2ZmNbCxVxBnJkLpQrStUvWxYz1A2B3C4D5E6F7G8H9JK", type: "Honeypot",       risk: "medium"   as const, victims: 12,  volume: "44 SOL",    added: "2w ago" },
  { addr: "7QwErTyUiOpAsDfGhJkLzXcVbNmQwErTyUiOpAsDfGh1", type: "Pump & Dump",    risk: "medium"   as const, victims: 0,   volume: "612 SOL",   added: "3w ago" },
];

function ThreatsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-danger">
            <ShieldAlert className="h-3 w-3" /> Verified blacklist
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
            Threat database
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-dim">
            Wallets verified through community submissions and forensic investigation. Synced to all integrated wallets and explorers.
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-dim" />
          <input
            placeholder="Search address, type, hash…"
            className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text placeholder:text-text-dim/70 focus:border-accent/50 focus:outline-none"
          />
        </div>
      </div>

      {/* table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <div className="hidden grid-cols-[2.4fr_1fr_1fr_0.8fr_0.8fr_0.6fr_0.4fr] border-b border-border bg-bg/60 px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim md:grid">
          <div>Wallet</div>
          <div>Threat type</div>
          <div>Risk</div>
          <div className="text-right">Victims</div>
          <div className="text-right">Volume</div>
          <div className="text-right">Added</div>
          <div></div>
        </div>

        <ul className="divide-y divide-border">
          {THREATS.map((t) => (
            <li
              key={t.addr}
              className="grid grid-cols-1 gap-2 px-4 py-3 transition-colors hover:bg-surface-elevated/50 md:grid-cols-[2.4fr_1fr_1fr_0.8fr_0.8fr_0.6fr_0.4fr] md:items-center"
            >
              <div className="font-mono text-[12px] text-text break-all">{t.addr}</div>
              <div className="text-[12px] text-text-dim">{t.type}</div>
              <div><RiskBadge level={t.risk} /></div>
              <div className="text-right font-mono text-[12px] tabular-nums text-text">{t.victims}</div>
              <div className="text-right font-mono text-[12px] tabular-nums text-text">{t.volume}</div>
              <div className="text-right font-mono text-[10px] uppercase tracking-widest text-text-dim">{t.added}</div>
              <div className="flex justify-end">
                <a
                  href="#"
                  className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-bg text-text-dim hover:border-accent/40 hover:text-accent transition-colors"
                  aria-label="Open"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
