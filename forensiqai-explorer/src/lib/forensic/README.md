# ForensiqAI Forensic Intelligence Engine

Modular, production-grade forensic detection and intelligence system for blockchain investigations.

## Features
- Modular heuristic engine (rug pulls, flash loans, phishing, mixers, bridges, oracles, Sybil, etc)
- Multi-factor risk scoring (configurable, explainable)
- Evidence and report builder (JSON, markdown, executive summary)
- Quantum vulnerability model (Ed25519, signature count, exposure)
- Threat intelligence correlation (malicious wallet DB, exploit family, laundering)
- Advanced graph/cluster analysis (fan-out, laundering, anomaly, recursive expansion)

## Integration
- Import and use `ForensicEngine` for end-to-end analysis and reporting.
- All modules are fully typed and extensible.

## Example
```ts
import { ForensicEngine } from './forensic/engine';
const engine = new ForensicEngine(config);
const result = await engine.analyzeWallet(walletAddress, txHistory);
console.log(result.report.markdownSummary);
```
