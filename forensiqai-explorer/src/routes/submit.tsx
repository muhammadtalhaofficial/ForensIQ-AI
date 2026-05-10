import { createFileRoute } from "@tanstack/react-router";
import { ThreatSubmitForm } from "@/components/forensiq/ThreatSubmitForm";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit Threat · ForensiqAI" },
      { name: "description", content: "Report a malicious wallet to the ForensiqAI community blacklist." },
    ],
  }),
  component: SubmitPage,
});

function SubmitPage() {
  return <ThreatSubmitForm />;
}
