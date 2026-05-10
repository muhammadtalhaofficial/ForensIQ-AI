# ForensiqAI — RAG Architecture

This folder contains a production-oriented Retrieval-Augmented Generation (RAG) architecture for ForensiqAI — a blockchain forensic investigation engine.

Overview:
- Postgres + pgvector (via Supabase) stores documents and embeddings
- OpenAI `text-embedding-3-small` for embeddings
- TypeScript modules for chunking, ingestion, embedding, storage, retrieval and RAG prompt composition

Key files:
- `supabase/migrations/001_init.sql` — DB schema and indexes (ivfflat)
- `src/lib/rag/*` — core modules: `openai.ts`, `chunker.ts`, `ingest.ts`, `retriever.ts`, `contextBuilder.ts`
- `scripts/ingest-cli.ts` — example ingestion CLI
- `src/pages/api/forensiq/*` — Next.js API endpoints (ingest, query)

Environment variables:
- `SUPABASE_DB_URL` or `DATABASE_URL` — Postgres connection string
- `SUPABASE_DB_SSL` — set to `false` to disable SSL (not recommended)
- `OPENAI_API_KEY` — OpenAI API key
- `PGVECTOR_OP` — pgvector operator to use (`<->` for euclidean distance, `<=>` for cosine similarity). Default: `<->`

Install (suggested):
```bash
# in project root
npm install pg gray-matter pdf-parse @dqbd/tiktoken
# For running TS scripts with node
npm install -D ts-node typescript @types/node
```

Run DB migration (options):

- Option A — no `psql` required: use the included Node migration runner (recommended on Windows)
```bash
# from the repository root (forensiqai-explorer)
npm install pg ts-node
npm run rag:migrate
```

- Option B — if you prefer `psql` (install via Chocolatey, Scoop, or winget):
```powershell
# Chocolatey (if installed)
choco install postgresql -y
# or winget
winget install --id PostgreSQL.PostgreSQL -e
# then run
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_init.sql
```

Ingest data:

- If you are running commands from the repository root, change into the project folder first or use the path to the script. Recommended:
```bash
cd forensiqai-explorer
npx ts-node scripts/ingest-cli.ts ./data
```

- Or run from workspace root with an explicit path to the script:
```bash
npx ts-node forensiqai-explorer/scripts/ingest-cli.ts forensiqai-explorer/data
```

You can also use the npm helper added to `package.json`:
```bash
npm install ts-node
npm run rag:ingest -- forensiqai-explorer/data
```

Query API (Next.js API example):
- POST `/api/forensiq/query` with JSON `{ "query": "wallet draining pattern A", "topK": 8 }`

Notes & tuning:
- Tune `ivfflat` index `lists` parameter for dataset size in `001_init.sql`.
- Adjust `EMBEDDING_DIM` if you switch embedding model.
- `PGVECTOR_OP` must match your pgvector extension's supported operator semantics; verify in your DB.
