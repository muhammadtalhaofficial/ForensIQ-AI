# Forensiq Engine (Rust)

High-performance Rust forensic engine for blockchain analysis. Features:

- Async RPC fetchers (Helius / JSON-RPC)
- Transaction parsing and transfer extraction
- Directed transaction graph using petgraph
- Heuristic detection (rapid drain, mixers, flash loans, wash trading)
- Parallel processing with Rayon + Tokio
- Plugin interface for custom heuristics
- JSON forensic reports and report hashing

Quick start

```bash
cd rust/forensiq-engine
cargo build --release
cargo run -- <wallet_address>
```

Environment variables

- `HELIUS_API_KEY` — optional Helius key for transaction fetching
- `RPC_URL` — optional JSON-RPC endpoint for direct RPC fetching
