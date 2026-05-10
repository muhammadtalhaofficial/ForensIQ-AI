import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onTranscript: (text: string) => void;
  className?: string;
}

// Minimal SpeechRecognition shape we rely on
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function VoiceButton({ onTranscript, className }: Props) {
  const [listening, setListening] = useState(false);

  const start = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    const recog = new Ctor();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.continuous = false;
    recog.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      if (text) onTranscript(text);
    };
    recog.onend = () => setListening(false);
    recog.onerror = () => setListening(false);
    recog.start();
    setListening(true);
  };

  return (
    <button
      type="button"
      aria-label={listening ? "Stop listening" : "Start voice input"}
      onClick={start}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-md border transition-all",
        listening
          ? "border-danger/50 bg-danger/10 text-danger"
          : "border-border bg-surface text-text-dim hover:border-accent/40 hover:text-accent",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {listening ? (
          <motion.span key="stop" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
            <Square className="h-4 w-4 fill-current" />
          </motion.span>
        ) : (
          <motion.span key="mic" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}>
            <Mic className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {listening && (
        <span className="absolute inset-0 rounded-md border border-danger/40 animate-ping" />
      )}
    </button>
  );
}
