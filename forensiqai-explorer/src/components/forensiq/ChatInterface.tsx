import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { VoiceButton } from "./VoiceButton";
import { generateMockInvestigation, isLikelySolanaAddress, SOLANA_ADDRESS_REGEX } from "@/lib/forensiq/mock";
import type { ChatMessage, InvestigationResult } from "@/lib/forensiq/types";
import { cn } from "@/lib/utils";
import { investigateWallet } from "@/lib/forensiq/serverFunctions";

const SUGGESTIONS = [
  "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
  "Investigate this wallet 6dM4TqWyWJsbx4dvMq2qUL3vGvJv6V5Gq6Y5gZ5xZ5pN for drainer activity",
  "Was 3yFwqXBfZY4G7Z9zQK8mXxLkH4nKp1ZcMv2QwR7jL5tA involved in any phishing attacks?",
];

const uid = () => Math.random().toString(36).slice(2, 10);

function extractAddress(text: string) {
  const m = text.match(SOLANA_ADDRESS_REGEX);
  return m?.[0];
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uid(),
      role: "system",
      content: "ForensiqAI online. Paste a Solana wallet address or describe suspicious activity to begin investigation.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLastReport] = useState<InvestigationResult | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // textarea autosize
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || isLoading) return;
    setInput("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);

    const address = extractAddress(text);
    if (!address) {
      setMessages((m) => [
        ...m,
        {
          id: uid(),
          role: "assistant",
          content:
            "I need a Solana wallet address to start. Paste a base58 address (32–44 chars) or include one in your description.",
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    const loadingId = uid();
    setIsLoading(true);
    setMessages((m) => [...m, { id: loadingId, role: "assistant", content: "", timestamp: Date.now(), isLoading: true }]);

    try {
      // Call server function with an object containing `data` per TanStack Start API
      const data = await investigateWallet({ data: address });
      console.log('[CLIENT] Investigation returned data:', data);
      const result = data?.result;

      if (!result) throw new Error('Investigation failed: No data returned');

      setLastReport(result);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? { ...msg, isLoading: false, content: result.summary || '', result, timestamp: Date.now() }
            : msg,
        ),
      );
    } catch (err: any) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? { ...msg, isLoading: false, content: `Error: ${err.message || 'Investigation failed'}`, timestamp: Date.now() }
            : msg,
        ),
      );
    }
    setIsLoading(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const showSuggestions = messages.filter((m) => m.role !== "system").length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* MESSAGES */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-6 md:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {/* hero (only when empty) */}
          {showSuggestions && (
            <div className="mb-2 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                <Sparkles className="h-3 w-3" /> AI forensic copilot
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
                Investigate any wallet.{" "}
                <span className="text-accent text-glow">Prove it on-chain.</span>
              </h1>
              <p className="mx-auto mt-2 max-w-xl text-sm text-text-dim">
                Paste a Solana address or describe what happened. ForensiqAI fetches the full transaction
                graph, runs pattern detection, and stores a tamper-proof report on Solana.
              </p>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {showSuggestions && (
            <div className="mt-2 grid gap-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
                Try a sample query
              </div>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm text-text-dim transition-all hover:border-accent/40 hover:bg-surface-elevated hover:text-text"
                >
                  <span className={cn("truncate", isLikelySolanaAddress(s) && "font-mono text-[12px]")}>
                    {s}
                  </span>
                  <Send className="h-3.5 w-3.5 shrink-0 text-text-dim transition-colors group-hover:text-accent" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* COMPOSER */}
      <div className="sticky bottom-0 border-t border-border bg-bg/80 px-3 py-3 backdrop-blur-xl md:px-6">
        <div className="mx-auto max-w-3xl">
          <div
            className={cn(
              "group flex items-end gap-2 rounded-xl border bg-surface p-2 transition-all",
              isLoading ? "border-accent/40 glow-accent" : "border-border focus-within:border-accent/50 focus-within:glow-accent",
            )}
          >
            <VoiceButton onTranscript={(t) => {
              const val = input ? `${input} ${t}` : t;
              setInput(val);
              send(val);
            }} />

            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Paste a Solana wallet or describe suspicious activity…"
              className="flex-1 resize-none bg-transparent px-2 py-2 text-sm text-text placeholder:text-text-dim/70 focus:outline-none"
              disabled={isLoading}
            />

            <button
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-md px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all",
                !input.trim() || isLoading
                  ? "cursor-not-allowed border border-border bg-surface-elevated text-text-dim"
                  : "border border-accent/50 bg-accent/15 text-accent hover:bg-accent/25 glow-accent",
              )}
            >
              {isLoading ? "Scanning" : "Scan"}
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 px-1 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim/70">
            Reports stored permanently on Solana · Not financial or legal advice
          </div>
        </div>
      </div>
    </div>
  );
}
