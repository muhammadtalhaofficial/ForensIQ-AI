# ForensIQ — AI-Powered Blockchain Forensic Investigator

> Investigate Solana wallets, detect exploit patterns, and anchor tamper-proof forensic reports on-chain — all powered by an AI reasoning pipeline backed by a vector knowledge base.

---

## What Is This?

ForensIQ is a full-stack blockchain forensics platform built on Solana. You paste a wallet address, and the system:

1. Pulls the wallet's full transaction history from the Solana blockchain via the Helius API
2. Runs 13 forensic heuristics across the transaction data (rug pulls, mixers, flash attacks, drainers, etc.)
3. Searches a RAG knowledge base of past forensic cases using semantic vector search
4. Feeds everything into an LLM (Groq / Llama 3.3 70B) to produce a structured investigation report
5. Anchors a SHA-256 hash of the report as a Solana memo transaction — permanently and immutably on-chain
6. Displays the report in a chat-style UI with risk scores, confidence meters, and pattern grids

There is also a high-performance Rust binary (`rust/forensiq-engine`) that runs the same forensic pipeline as a standalone CLI tool with parallel processing via Rayon.

---

## Architecture Overview

```
User Input (wallet address)
          │
          ▼
  Helius API (Solana RPC)
  → fetch transaction history
          │
          ▼
  Forensic Heuristics Engine
  → 13 detection categories
  → risk scoring
          │
          ├──────────────────────────────────────┐
          ▼                                      ▼
  RAG Pipeline                        Groq LLM (Llama 3.3 70B)
  → embed query (OpenAI)              → structured JSON report
  → semantic search (pgvector)        → risk level + confidence
  → retrieve matching case docs       → markdown full report
          │                                      │
          └──────────────┬───────────────────────┘
                         ▼
              On-chain Report Anchoring
              → Solana Memo Program
              → tamper-proof hash stored on-chain
                         │
                         ▼
                  React UI (TanStack)
                  → ChatInterface
                  → ConfidenceMeter
                  → ThreatPatternGrid
                  → MetadataPanel
```

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | TanStack Router (file-based) |
| Data fetching | TanStack Query |
| Styling | Tailwind CSS v4 + shadcn/ui |
| UI primitives | Radix UI |
| Animation | Framer Motion |
| Charts | Recharts |
| Build tool | Vite 7 |
| Deployment | Cloudflare Workers |

### Backend / AI
| Layer | Technology |
|---|---|
| Server runtime | TanStack Start (SSR) |
| LLM | Groq — Llama 3.3 70B Versatile |
| Embeddings | OpenAI `text-embedding-3-small` |
| Vector DB | Supabase + pgvector |
| Blockchain data | Helius Enhanced RPC |
| On-chain anchoring | Solana Memo Program |
| Voice output | ElevenLabs TTS |
| Local model fallback | @xenova/transformers (HuggingFace) |

### Rust Engine
| Layer | Technology |
|---|---|
| Async runtime | Tokio |
| HTTP client | Reqwest |
| Parallelism | Rayon |
| Graph algorithms | Petgraph |
| Hashing | SHA2 |
| Serialization | Serde + serde_json |
| Logging | Tracing + tracing-subscriber |

---

## Project Structure

```
ForensIQ/
├── forensiqai-explorer/          # Main web application
│   ├── src/
│   │   ├── components/
│   │   │   ├── forensiq/         # App-specific UI components
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── ConfidenceMeter.tsx
│   │   │   │   ├── ThreatPatternGrid.tsx
│   │   │   │   ├── MetadataPanel.tsx
│   │   │   │   ├── IntelligenceFeed.tsx
│   │   │   │   ├── ReportCard.tsx
│   │   │   │   ├── RiskBadge.tsx
│   │   │   │   ├── VoiceButton.tsx
│   │   │   │   └── ...
│   │   │   └── ui/               # shadcn/ui base components
│   │   ├── lib/
│   │   │   ├── forensic/         # TypeScript heuristics engine
│   │   │   │   ├── engine.ts     # ForensicEngine class
│   │   │   │   ├── heuristics.ts # 13 detection categories
│   │   │   │   └── types.ts      # Shared types
│   │   │   ├── solana/           # Solana blockchain clients
│   │   │   │   ├── analyzer.ts   # Main wallet analyzer
│   │   │   │   ├── heliusClient.ts
│   │   │   │   ├── memoStore.ts  # On-chain report anchoring
│   │   │   │   ├── knownMixers.ts
│   │   │   │   └── verifier.ts
│   │   │   └── rag/              # RAG pipeline
│   │   │       ├── chunker.ts
│   │   │       ├── ingest.ts
│   │   │       ├── openai.ts
│   │   │       ├── retriever.ts
│   │   │       ├── contextBuilder.ts
│   │   │       └── store.ts
│   │   ├── pages/api/forensiq/   # API endpoints
│   │   │   ├── investigate.ts    # Main investigation endpoint
│   │   │   ├── ingest.ts         # RAG document ingestion
│   │   │   ├── query.ts          # RAG semantic search
│   │   │   └── voice.ts          # ElevenLabs TTS
│   │   └── routes/               # Page routes
│   │       ├── index.tsx         # Investigate page
│   │       ├── threats.tsx       # Threat database
│   │       └── submit.tsx        # Submit threat report
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_init.sql      # pgvector schema + indexes
│   ├── scripts/
│   │   ├── ingest-cli.ts         # CLI: ingest documents into RAG
│   │   ├── run-migration.ts      # CLI: run DB migration
│   │   └── solana-inspect.ts     # CLI: inspect Solana wallet
│   └── data/                     # Drop forensic case docs here
│
└── rust/
    └── forensiq-engine/          # Standalone Rust forensic CLI
        ├── src/
        │   ├── main.rs           # CLI entry point
        │   ├── analyzer.rs       # Full analysis pipeline
        │   ├── rpc.rs            # Helius HTTP client
        │   ├── parser.rs         # Transaction parser
        │   ├── graph.rs          # Petgraph wallet graph
        │   ├── heuristics.rs     # Signal detection (parallel)
        │   ├── types.rs          # Shared types
        │   └── utils.rs          # SHA-256 hashing
        └── Cargo.toml
```

---

## Detection Categories

The forensic engine checks for 13 threat patterns on every investigation:

| Category | What It Detects |
|---|---|
| `rug_pull` | Mass token sell-off, liquidity removal, dev wallet drain |
| `flash_loan` | Borrow and repay within the same block |
| `phishing_drainer` | Wallet drainer contracts, approval hijacking |
| `mixer_laundering` | Interaction with known tumbler/mixer addresses |
| `bridge_exploit` | Suspicious cross-chain bridge interactions |
| `oracle_manipulation` | Price oracle attacks, sandwich patterns |
| `wash_trading` | Circular transfers between related wallets |
| `sybil_attack` | Many wallets funded from single source |
| `pump_and_dump` | Coordinated buy pressure followed by mass sell |
| `honeypot` | Contracts that block sells |
| `dormant_activation` | Old wallet suddenly moving large funds |
| `coordinated_draining` | Multiple wallets draining simultaneously |
| `validator_compromise` | Validator key misuse patterns |

---

## Prerequisites

- Node.js 18+ or Bun
- Rust 1.75+ (for the Rust engine only)
- A Supabase project with pgvector enabled
- API keys (see Environment Variables)

---

## Quick Start

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/forensiq.git
cd forensiq/forensiqai-explorer
npm install
```

### 2. Set up environment variables

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` (see Environment Variables section below).

### 3. Run the database migration

This creates the `documents` table and `pgvector` index in Supabase:

```bash
npm run rag:migrate
```

### 4. Ingest your forensic knowledge base

Drop markdown, PDF, or text files into the `data/` folder, then run:

```bash
npm run rag:ingest -- ./data
```

The more forensic case documents you ingest (hack postmortems, mixer reports, exploit analyses), the better the RAG-powered investigations become.

### 5. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000` and paste any Solana wallet address to start an investigation.

---

## Environment Variables

Create a `.env.local` file in `forensiqai-explorer/` with the following:

```env
# Solana / Helius
HELIUS_API_KEY=your_helius_api_key
SOLANA_NETWORK=mainnet-beta        # or devnet for testing
SOLANA_PRIVATE_KEY=your_base58_private_key   # used for on-chain report anchoring

# AI / LLM
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_FALLBACK_MODEL=llama-3.1-8b-instant
OPENAI_API_KEY=your_openai_api_key  # for embeddings only

# Supabase (RAG vector store)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=postgresql://...    # direct Postgres connection for migrations

# Voice (optional)
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_voice_id

# Local model fallback (optional)
HF_API_KEY=your_huggingface_key
FORCE_LOCAL_MOCK=false
```

> **Security note:** Never commit `.env.local` to version control. Add it to `.gitignore` immediately. Rotate any keys that have been exposed.

---

## Rust Engine

The Rust binary provides the same forensic analysis as the TypeScript layer but runs entirely locally with no LLM — pure heuristic analysis with parallel processing.

### Build

```bash
cd rust/forensiq-engine
cargo build --release
```

### Run

```bash
# Analyze a wallet (outputs JSON report to stdout)
cargo run --release -- <WALLET_ADDRESS>

# Limit transaction history
cargo run --release -- <WALLET_ADDRESS> 500
```

### Environment Variables (Rust)

```env
HELIUS_API_KEY=your_helius_key   # optional, falls back to public RPC
RPC_URL=https://api.mainnet-beta.solana.com  # optional custom RPC
```

The Rust engine outputs a JSON `ForensicReport` including:
- Total incoming / outgoing volume
- Transaction count
- Counterparty analysis with risk scores
- Forensic signals (rapid draining, mixer interaction, flash attack, etc.)
- Overall risk score (0.0 – 1.0)
- SHA-256 report hash for integrity verification

---

## API Endpoints

All endpoints live under `src/pages/api/forensiq/`.

### `POST /api/forensiq/investigate`

Run a full AI forensic investigation on a Solana wallet.

**Request:**
```json
{
  "walletAddress": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
}
```

**Response:**
```json
{
  "riskLevel": "critical",
  "confidence": 91,
  "summary": "This wallet shows coordinated draining behavior...",
  "fullReport": "# Forensic Report\n## Overview\n...",
  "patterns": [
    { "name": "Rapid Drain", "detected": true, "detail": "68% of total volume moved in 24h" },
    { "name": "Mixer Interaction", "detected": true, "detail": "3 transfers to known tumbler" }
  ],
  "relatedAddresses": ["..."],
  "txSignature": "...",
  "explorerUrl": "https://explorer.solana.com/tx/..."
}
```

### `POST /api/forensiq/ingest`

Ingest a document into the RAG knowledge base.

```json
{
  "content": "...",
  "metadata": { "title": "Ronin Bridge Hack Analysis", "source": "internal" }
}
```

### `POST /api/forensiq/query`

Run a semantic search against the RAG knowledge base.

```json
{
  "query": "wallet draining pattern phishing",
  "topK": 8
}
```

### `POST /api/forensiq/voice`

Convert a forensic report to speech via ElevenLabs.

```json
{
  "text": "Wallet assessed as critical risk. Three threat indicators triggered..."
}
```

---

## Database Schema

The Supabase migration (`supabase/migrations/001_init.sql`) creates:

```sql
-- Enable pgvector
create extension if not exists vector;

-- Document store for RAG
create table documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536),       -- OpenAI text-embedding-3-small
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- IVFFlat index for fast ANN search
create index on documents
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Semantic search function
create function match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
) returns table (...)
```

---

## Removing Lovable Traces

If you scaffolded this project via Lovable, run these steps to clean it up:

```bash
# 1. Delete the Lovable project folder
rm -rf .lovable/

# 2. Replace vite.config.ts (see below)

# 3. Remove the Lovable devDependency from package.json
# Delete: "@lovable.dev/vite-tanstack-config": "^1.5.1"

# 4. Reinstall
npm install
```

**Replace `vite.config.ts` with:**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    TanStackRouterVite({ autoCodeSplitting: true }),
    tanstackStart({ server: { entry: "server" } }),
    react(),
    cloudflare(),
  ],
  define: { global: "window" },
  optimizeDeps: { include: ["buffer"] },
});
```

---

## Deployment

### Cloudflare Workers (recommended)

```bash
npm run build
npx wrangler deploy
```

The `wrangler.jsonc` is already configured. Set your environment variables in the Cloudflare dashboard under Workers → Settings → Variables.

### Local production build

```bash
npm run build
npm run preview
```

---

## Scripts Reference

| Command | What It Does |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run rag:migrate` | Run Supabase DB migration |
| `npm run rag:ingest -- ./data` | Ingest documents into RAG |
| `npm run solana:analyze` | Inspect a wallet via CLI |

---

## Roadmap

- [ ] Complete heuristic detection logic (all 13 categories)
- [ ] Populate RAG knowledge base with real forensic case docs
- [ ] Connect Rust engine output directly to TypeScript API pipeline
- [ ] Interactive transaction graph visualization (D3/Cytoscape)
- [ ] Ethereum / EVM chain support
- [ ] Persistent wallet database with historical risk scores
- [ ] Real-time wallet monitoring via Solana WebSocket RPC
- [ ] Wallet cluster detection across coordinated attack groups
- [ ] Fine-tuned forensic LLM on labeled blockchain attack data
- [ ] PDF/CSV forensic report export for compliance handoffs

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'add: my feature'`
4. Push: `git push origin feature/my-feature`
5. Open a pull request

For heuristic contributions, add your detection logic to `src/lib/forensic/heuristics.ts` following the existing `HeuristicFn` signature. Each heuristic should return a `ForensicHeuristicResult` with `triggered`, `confidence` (0–1), and an `evidence` string array.

---

## Security

- Never commit `.env.local` or any file containing API keys
- The Solana private key in `.env.local` is used only for signing on-chain memo transactions — use a dedicated wallet with minimal SOL balance, not your main wallet
- All API keys in the repo (if any) should be considered compromised — rotate them immediately
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses row-level security — keep it server-side only, never expose it to the client

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

## Acknowledgements

- [Helius](https://helius.dev) — Enhanced Solana RPC and transaction data
- [Groq](https://groq.com) — Ultra-fast LLM inference
- [Supabase](https://supabase.com) — Postgres + pgvector
- [Solana](https://solana.com) — Layer 1 blockchain
- [TanStack](https://tanstack.com) — Router, Query, Start
- [shadcn/ui](https://ui.shadcn.com) — UI component system
- [ElevenLabs](https://elevenlabs.io) — Voice synthesis
