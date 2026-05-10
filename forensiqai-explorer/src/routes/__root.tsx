import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Buffer } from "buffer";
import { SpeedInsights } from "@vercel/speed-insights/react";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

import appCss from "../styles.css?url";
import { TopNavbar } from "@/components/forensiq/TopNavbar";
import { Footer } from "@/components/forensiq/Footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
          Error · 404
        </div>
        <h1 className="mt-2 font-display text-5xl font-bold text-text">Signal lost</h1>
        <p className="mt-3 text-sm text-text-dim">
          The route you're looking for doesn't exist on this network.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent hover:bg-accent/20 transition-colors"
        >
          Return to console
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="max-w-md text-center">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-danger">
          System error
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold text-text">An exception occurred</h1>
        <p className="mt-2 text-sm text-text-dim">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-5 inline-flex items-center rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent hover:bg-accent/20 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ForensiqAI — AI-powered Blockchain Forensic Investigator" },
      {
        name: "description",
        content:
          "Investigate Solana wallets, detect exploit patterns, and store immutable on-chain evidence with an AI forensic copilot.",
      },
      { name: "author", content: "ForensiqAI" },
      { property: "og:title", content: "ForensiqAI — Blockchain Forensic Investigator" },
      {
        property: "og:description",
        content:
          "AI-powered blockchain forensic investigation, on-chain evidence, voice-narrated reports.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="dark min-h-screen bg-bg text-text antialiased">
        {children}
        <Scripts />
        <SpeedInsights />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <TopNavbar />
        <main className="relative flex-1">
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
          <div className="relative h-full">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
      <div className="scanline-overlay" />
    </QueryClientProvider>
  );
}
