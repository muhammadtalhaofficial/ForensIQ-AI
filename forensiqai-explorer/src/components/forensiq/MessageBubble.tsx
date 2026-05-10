import { motion } from "framer-motion";
import type { ChatMessage } from "@/lib/forensiq/types";
import { ReportCard } from "./ReportCard";
import { InvestigationLoader } from "./InvestigationLoader";
import { cn } from "@/lib/utils";
import { Bot, User as UserIcon, Terminal } from "lucide-react";

function timeOf(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={cn("flex w-full gap-2.5", isUser && "justify-end")}
    >
      {!isUser && (
        <div
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
            isSystem
              ? "border-border bg-surface text-text-dim"
              : "border-accent/30 bg-accent/10 text-accent",
          )}
        >
          {isSystem ? <Terminal className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </div>
      )}

      <div className={cn("flex max-w-[92%] flex-col gap-1.5 md:max-w-[78%]", isUser && "items-end")}>
        {message.isLoading ? (
          <InvestigationLoader />
        ) : message.result ? (
          <ReportCard result={message.result} />
        ) : (
          <div
            className={cn(
              "rounded-lg border px-3 py-2 text-sm leading-relaxed",
              isUser
                ? "border-accent/30 bg-accent/5 text-text shadow-[0_0_18px_-8px_var(--accent-glow)]"
                : isSystem
                  ? "border-border bg-bg/60 font-mono text-[12px] text-text-dim"
                  : "border-border bg-surface text-text",
            )}
          >
            {message.content}
          </div>
        )}
        <span suppressHydrationWarning className="px-1 font-mono text-[9px] uppercase tracking-[0.15em] text-text-dim/70">
          {timeOf(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-dim">
          <UserIcon className="h-3.5 w-3.5" />
        </div>
      )}
    </motion.div>
  );
}
