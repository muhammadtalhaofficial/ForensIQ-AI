import { Link, useRouterState } from "@tanstack/react-router";
import { Layers, Shield } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "INVESTIGATE", to: "/" },
  { label: "THREAT DATABASE", to: "/threats" },
  { label: "SUBMIT THREAT", to: "/submit" },
] as const;

export function TopNavbar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-surface-elevated">
            <Layers className="h-4 w-4 text-accent transition-transform group-hover:rotate-12" strokeWidth={2.2} />
            <div className="pointer-events-none absolute inset-0 rounded-md shadow-[0_0_18px_-2px] shadow-accent/40" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold tracking-tight text-text">
              Forensiq<span className="text-accent">AI</span>
            </span>
            <span className="hidden md:inline rounded border border-border bg-surface px-1.5 py-px font-mono text-[9px] uppercase tracking-widest text-text-dim">
              v1.0 · DEVNET
            </span>
          </div>
        </Link>

        {/* Tabs */}
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {tabs.map((t) => {
            const active = pathname === t.to;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                  active
                    ? "text-accent"
                    : "text-text-dim hover:text-text",
                )}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-[15px] h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <StatusIndicator className="hidden sm:flex" />
          <button className="hidden md:inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim hover:border-accent/40 hover:text-accent transition-colors">
            <Shield className="h-3 w-3" />
            Secure session
          </button>
        </div>
      </div>

      {/* Mobile tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden">
        {tabs.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] whitespace-nowrap transition-colors",
                active ? "bg-accent/10 text-accent border border-accent/30" : "text-text-dim",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
