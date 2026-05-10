import { createFileRoute } from "@tanstack/react-router";
import { ChatInterface } from "@/components/forensiq/ChatInterface";
import { IntelligenceFeed } from "@/components/forensiq/IntelligenceFeed";
import { MetadataPanel } from "@/components/forensiq/MetadataPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Investigate · ForensiqAI" },
      { name: "description", content: "Run an AI forensic investigation on any Solana wallet." },
    ],
  }),
  component: InvestigatePage,
});

function InvestigatePage() {
  return (
    <div className="grid h-[calc(100vh-3.5rem-2.5rem)] grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_300px]">
      <IntelligenceFeed />
      <section className="min-w-0">
        <ChatInterface />
      </section>
      <MetadataPanel />
    </div>
  );
}
