import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Send, ShieldAlert, Vote, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const THREAT_TYPES = [
  { value: "rug_pull",            label: "Rug Pull" },
  { value: "phishing",            label: "Phishing" },
  { value: "wallet_drainer",      label: "Wallet Drainer" },
  { value: "mixer_usage",         label: "Mixer Usage" },
  { value: "flash_loan_exploit",  label: "Flash Loan Exploit" },
  { value: "honeypot",            label: "Honeypot" },
  { value: "pump_and_dump",       label: "Pump & Dump" },
  { value: "other",               label: "Other" },
];

export function ThreatSubmitForm() {
  const [wallet, setWallet] = useState("");
  const [chain, setChain] = useState<"solana" | "ethereum">("solana");
  const [type, setType] = useState("wallet_drainer");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet || !desc) return;
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1100));
    setStatus("success");
    setTimeout(() => {
      setWallet(""); setDesc(""); setStatus("idle");
    }, 2500);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-warn/30 bg-warn/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-warn">
          <ShieldAlert className="h-3 w-3" /> Community threat intelligence
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-text md:text-4xl">
          Report a malicious wallet
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-text-dim">
          Submissions are reviewed and added to the shared blacklist after community verification.
        </p>
      </div>

      {/* Glass form card */}
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative overflow-hidden rounded-xl p-5 md:p-7"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />

        {/* Wallet */}
        <Field label="Wallet address" required>
          <input
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
            className="w-full rounded-md border border-border bg-bg px-3 py-2.5 font-mono text-[13px] text-text placeholder:text-text-dim/60 focus:border-accent/50 focus:outline-none focus:glow-accent"
          />
        </Field>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Blockchain">
            <div className="flex gap-1 rounded-md border border-border bg-bg p-1">
              {(["solana", "ethereum"] as const).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setChain(c)}
                  className={cn(
                    "flex-1 rounded px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors",
                    chain === c ? "bg-accent/15 text-accent" : "text-text-dim hover:text-text",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Threat type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-md border border-border bg-bg px-3 py-2.5 text-[13px] text-text focus:border-accent/50 focus:outline-none"
            >
              {THREAT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description" required>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={5}
              placeholder="Describe what happened, how the threat was discovered, and any supporting evidence (transaction hashes, victim count, etc.)…"
              className="w-full resize-none rounded-md border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-dim/60 focus:border-accent/50 focus:outline-none"
            />
          </Field>
        </div>

        {/* Warning banner */}
        <div className="mt-4 flex items-start gap-2 rounded-md border border-warn/30 bg-warn/5 px-3 py-2.5 text-[12px] text-warn">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            False reports degrade the network. Only submit wallets you have verifiable on-chain evidence against.
          </span>
        </div>

        {/* Submit */}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          {status === "success" && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-accent"
            >
              <CheckCircle2 className="h-4 w-4" /> Threat submitted for review
            </motion.span>
          )}
          <button
            type="submit"
            disabled={status === "sending" || !wallet || !desc}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-md px-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] transition-all",
              !wallet || !desc || status === "sending"
                ? "cursor-not-allowed border border-border bg-surface-elevated text-text-dim"
                : "border border-accent/50 bg-accent/15 text-accent hover:bg-accent/25 glow-accent",
            )}
          >
            {status === "sending" ? "Submitting" : "Submit threat"}
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.form>

      {/* Process explainer */}
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        <Step n="01" Icon={Send}     title="Submit"  text="Provide wallet, threat type, and on-chain evidence." />
        <Step n="02" Icon={Vote}     title="Vote"    text="The community upvotes and validates each submission." />
        <Step n="03" Icon={Database} title="Blacklist" text="Verified threats sync to the global blacklist within minutes." />
      </div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-text-dim">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function Step({ n, Icon, title, text }: { n: string; Icon: typeof Send; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-accent" />
        <span className="font-mono text-[10px] tracking-widest text-text-dim">{n}</span>
      </div>
      <div className="mt-2 font-display text-sm font-bold uppercase tracking-[0.14em] text-text">{title}</div>
      <p className="mt-1 text-[12px] leading-relaxed text-text-dim">{text}</p>
    </div>
  );
}
