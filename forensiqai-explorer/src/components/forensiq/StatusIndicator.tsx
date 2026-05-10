import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  label?: string;
  state?: "online" | "scanning" | "offline";
  className?: string;
}

export function StatusIndicator({ label = "SYSTEM ONLINE", state = "online", className }: StatusIndicatorProps) {
  const color =
    state === "online" ? "bg-accent" : state === "scanning" ? "bg-warn" : "bg-muted";
  return (
    <div className={cn("flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim", className)}>
      <span className="relative flex h-2 w-2">
        <span className={cn("absolute inset-0 rounded-full opacity-75 animate-ping", color)} />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", color)} />
      </span>
      <span>{label}</span>
    </div>
  );
}
