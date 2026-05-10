import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg/95 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-dim">
        <div className="flex items-center gap-3">
          <span>ForensiqAI © 2026</span>
          <span className="hidden md:inline">·</span>
          <span className="hidden md:inline">Powered by Groq · Helius · Supabase · Solana · ElevenLabs</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-3 w-3 text-accent" />
          <span className="text-accent">Open Source · Free Forever</span>
        </div>
      </div>
    </footer>
  );
}