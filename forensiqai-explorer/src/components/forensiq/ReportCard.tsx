import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  ChevronDown,
  ExternalLink,
  Play,
  Pause,
  Share2,
  Wallet,
  ArrowRightLeft,
  Coins,
  Users,
} from "lucide-react";
import type { InvestigationResult } from "@/lib/forensiq/types";
import { RiskBadge } from "./RiskBadge";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { ThreatPatternGrid } from "./ThreatPatternGrid";
import { QuantumRiskPanel } from "./QuantumRiskPanel";
import { cn } from "@/lib/utils";
import { generateVoice } from "@/lib/forensiq/serverFunctions";

function shortAddr(a: string) {
  return a.length > 14 ? `${a.slice(0, 6)}…${a.slice(-6)}` : a;
}

interface MetricProps {
  Icon: typeof Wallet;
  label: string;
  value: string;
  hint?: string;
}
function Metric({ Icon, label, value, hint }: MetricProps) {
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-text-dim">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 font-mono text-base font-semibold tabular-nums text-text">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[10px] text-text-dim">{hint}</div>}
    </div>
  );
}

export function ReportCard({ result }: { result: InvestigationResult }) {
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleVoice = async () => {
    if (playing) {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlaying(false);
      return;
    }

    setVoiceError(null);

    const text = `ForensiqAI investigation complete. Risk level: ${result.riskLevel}. Confidence: ${result.confidence} percent. ${result.summary}`;

    // Try ElevenLabs first, fall back to browser TTS if it fails
    try {
      const base64 = await generateVoice({ data: text });

      if (!base64 || typeof base64 !== 'string') {
        throw new Error("No audio data returned");
      }

      const binaryString = window.atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
      };
      setPlaying(true);
      await audio.play();
    } catch (e: any) {
      // ElevenLabs failed (quota, network, etc.) — fall back to browser TTS silently
      console.warn("ElevenLabs unavailable, using browser TTS:", e?.message);

      if (!window.speechSynthesis) {
        setVoiceError("Voice unavailable in this browser");
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onend = () => setPlaying(false);
      utterance.onerror = () => setPlaying(false);
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      {/* HEADER */}
      <div className="relative border-b border-border bg-gradient-to-b from-surface-elevated to-surface px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <RiskBadge level={result.riskLevel} large />
          <ConfidenceMeter value={result.confidence} level={result.riskLevel} />
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={toggleVoice}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim hover:border-accent/40 hover:text-accent transition-colors"
            >
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {playing ? "Pause" : "Play"} voice
            </button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-text-dim hover:border-accent/40 hover:text-accent transition-colors">
              <Share2 className="h-3 w-3" />
              Export
            </button>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-text-dim hover:border-accent/40 hover:text-accent transition-colors"
              aria-label="Toggle full report"
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
              />
            </button>
          </div>
        </div>

        {/* Voice error message */}
        {voiceError && (
          <div className="mt-2 rounded border border-danger/30 bg-danger/10 px-3 py-1.5 font-mono text-[10px] text-danger">
            ⚠ {voiceError}
          </div>
        )}

        {/* Wallet line */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
            Subject wallet
          </span>
          <code className="rounded border border-border bg-bg px-2 py-0.5 font-mono text-[11px] text-text break-all">
            {result.walletAddress}
          </code>
          <button
            onClick={() => copy(result.walletAddress)}
            className="inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-text-dim hover:text-accent hover:border-accent/40"
          >
            <Copy className="h-2.5 w-2.5" />
            {copied ? "Copied" : "Copy"}
          </button>
          <a
            href={`https://solscan.io/account/${result.walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-text-dim hover:text-accent hover:border-accent/40"
          >
            <ExternalLink className="h-2.5 w-2.5" />
            Solscan
          </a>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="border-b border-border px-4 py-4">
        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          Executive summary
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-text">{result.summary}</p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-2 gap-2 border-b border-border px-4 py-4 md:grid-cols-4">
        <Metric Icon={ArrowRightLeft} label="Tx Count" value={result.transactionCount.toString()} />
        <Metric Icon={Coins} label="Volume (SOL)" value={result.totalVolumeSOL.toFixed(2)} />
        <Metric Icon={Users} label="Counterparties" value={result.uniqueCounterparties.toString()} />
        <Metric Icon={Wallet} label="Patterns Hit" value={`${result.patterns.filter(p => p.detected).length} / ${result.patterns.length}`} />
      </div>

      {/* PATTERNS */}
      <div className="border-b border-border px-4 py-4">
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
          Forensic pattern detection
        </div>
        <ThreatPatternGrid patterns={result.patterns} />
      </div>

      {/* QUANTUM */}
      <div className="border-b border-border px-4 py-4">
        <QuantumRiskPanel risk={result.quantumRisk} />
      </div>

      {/* FULL REPORT */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="rep"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-b border-border px-4 py-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
                  Full forensic report
                </span>
                <span className="h-px flex-1 bg-gradient-to-r from-border via-border-strong to-transparent" />
              </div>
              <article className="report-prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.fullReport}</ReactMarkdown>
              </article>

              {/* Related addresses */}
              {result.relatedAddresses.length > 0 && (
                <div className="mt-5">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
                    Related addresses
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {result.relatedAddresses.map((a) => (
                      <li
                        key={a}
                        className="flex items-center justify-between rounded border border-border bg-bg px-2 py-1.5 font-mono text-[11px] text-text-dim"
                      >
                        <span className="truncate">{a}</span>
                        <button
                          onClick={() => copy(a)}
                          className="ml-2 text-text-dim hover:text-accent"
                          aria-label="Copy address"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ON-CHAIN EVIDENCE */}
      {result.txSignature && (
        <div className="relative overflow-hidden border-b border-border bg-gradient-to-r from-accent/5 via-transparent to-transparent px-4 py-3">
          <div className="absolute left-0 top-0 h-full w-0.5 bg-accent shadow-[0_0_12px_var(--accent-glow)]" />
          <div className="flex flex-wrap items-center justify-between gap-2 pl-2">
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent">
                On-chain evidence · immutable
              </div>
              <div className="mt-1 font-mono text-[11px] text-text-dim">
                tx: <span className="text-text">{shortAddr(result.txSignature)}</span>
                {result.reportHash && (
                  <>
                    {"  ·  "}
                    sha256: <span className="text-text">{shortAddr(result.reportHash)}</span>
                  </>
                )}
              </div>
            </div>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:bg-accent/20 transition-colors"
            >
              View evidence <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* RAG SOURCES */}
      {result.ragSources && result.ragSources.length > 0 && (
        <div className="px-4 py-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
            Intelligence sources used
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {result.ragSources.map((s) => (
              <span
                key={s.title}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-text-dim"
              >
                <span className="h-1 w-1 rounded-full bg-accent" />
                {s.title}
                <span className="text-accent/70">·{(s.similarity * 100).toFixed(0)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
