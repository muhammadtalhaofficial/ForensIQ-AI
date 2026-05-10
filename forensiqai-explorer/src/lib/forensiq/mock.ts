import type { InvestigationResult, RiskLevel } from "./types";

const SAMPLE_REPORT = `## Overview
The subject wallet exhibits a behavioral fingerprint consistent with an **automated drainer pipeline**. Funds are received from victim wallets in clustered bursts, immediately swapped through Jupiter into SOL, and forwarded to a downstream consolidation address within a median of **94 seconds**.

## Transaction Patterns
- 412 inbound transfers from **unique** counterparties — atypical for a personal wallet
- 87% of inflows are followed by an outflow within < 3 minutes (rapid drain)
- Jupiter swap router invoked on **96%** of outbound legs
- Three distinct dormancy windows of 14–22 days suggest scripted activation cycles

## Forensic Findings
1. **Wallet drainer signature** — matches the *Inferno Drainer* family (signature confidence 0.91)
2. **Mixer staging** — outflows cluster toward a wallet previously documented funding Tornado Cash bridge hops
3. **No legitimate counterparty graph** — 0 interactions with known CEX deposit wallets, NFT marketplaces, or DeFi protocols other than Jupiter

## Quantum Risk Assessment
The wallet has signed **412+ transactions**, each exposing the Ed25519 public key on-chain. Per Project Eleven's 2024 quantum-resistance research, any wallet with a publicly exposed public key falls into the **Tier-1 quantum risk class**. Recommended mitigation: rotate funds to a fresh, unused address before Q-Day.

## Conclusion & Recommendation
**HIGH RISK — Do not transact with this address.** Recommend immediate blacklisting, notification of partner exchanges, and inclusion in the community drainer registry. On-chain evidence has been hashed and committed to Solana for non-repudiation.`;

const SAMPLE_REPORT_LOW = `## Overview
This wallet shows behavior consistent with a **legitimate retail user**. Activity is sporadic, transactions are diverse, and counterparties include known DeFi protocols and a centralized exchange deposit wallet.

## Transaction Patterns
- Healthy mix of inbound and outbound activity over a 14-month window
- Counterparty graph includes Coinbase deposit (verified), Magic Eden, Marinade Finance
- No rapid-drain signatures, no mixer interactions detected

## Forensic Findings
1. No matches against known drainer, phisher, or mixer signatures
2. No interactions with sanctioned addresses
3. Transaction cadence is human-paced, not script-driven

## Quantum Risk Assessment
Public key has been exposed across 47 signed transactions. Long-term quantum risk is non-zero but standard for an active wallet.

## Conclusion & Recommendation
**LOW RISK.** No forensic indicators warrant flagging. Continue monitoring as part of routine intelligence cycles.`;

export function generateMockInvestigation(walletAddress: string): InvestigationResult {
  // Deterministic-ish risk based on address hash
  const seed = walletAddress.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const bucket = seed % 4;
  const riskLevel: RiskLevel =
    bucket === 0 ? "low" : bucket === 1 ? "medium" : bucket === 2 ? "high" : "critical";

  const isHigh = riskLevel === "high" || riskLevel === "critical";

  return {
    walletAddress,
    chain: "solana",
    riskLevel,
    confidence: 72 + (seed % 24),
    summary: isHigh
      ? "Wallet exhibits automated drainer behavior with rapid inbound-to-outbound cycling, Jupiter swap laundering, and downstream mixer staging. Signature consistent with Inferno Drainer family."
      : riskLevel === "medium"
        ? "Wallet shows mixed activity with two unexplained interactions with previously-flagged addresses. Recommend continued monitoring."
        : "Wallet shows normal retail behavior with diverse legitimate counterparties. No forensic indicators of compromise.",
    fullReport: isHigh ? SAMPLE_REPORT : SAMPLE_REPORT_LOW,
    patterns: [
      { name: "Rapid Drain", detected: isHigh, detail: isHigh ? "94s median drain window" : undefined },
      { name: "Mixer Interaction", detected: isHigh },
      { name: "Wallet Drainer Signature", detected: isHigh, detail: isHigh ? "Inferno Drainer family" : undefined },
      { name: "Phishing Pattern", detected: bucket === 3 },
      { name: "Flash Loan Exploit", detected: false },
      { name: "Honeypot", detected: false },
      { name: "Sanctioned Address Contact", detected: bucket === 3 },
      { name: "Bridge Hopping", detected: isHigh },
    ],
    relatedAddresses: [
      "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      "6dM4TqWyWJsbx4dvMq2qUL3vGvJv6V5Gq6Y5gZ5xZ5pN",
      "3yFwqXBfZY4G7Z9zQK8mXxLkH4nKp1ZcMv2QwR7jL5tA",
    ],
    quantumRisk: {
      exposedPublicKeyCount: isHigh ? 412 : 47,
      isAtRisk: isHigh,
      recommendation: isHigh
        ? "Wallet is in Tier-1 quantum risk class. Rotate all funds to a fresh, unsigned address before Q-Day."
        : "Standard exposure for an active wallet. Routine rotation recommended every 12–18 months.",
    },
    transactionCount: isHigh ? 412 : 47,
    firstSeen: "2024-01-14T08:23:00Z",
    lastSeen: "2025-04-22T17:41:00Z",
    totalVolumeSOL: isHigh ? 1284.7 : 38.2,
    uniqueCounterparties: isHigh ? 312 : 19,
    ragSources: [
      { title: "Wallet Drainer Pattern Recognition", category: "drainer", similarity: 0.89 },
      { title: "Inferno Drainer Family Signatures", category: "drainer", similarity: 0.84 },
      { title: "Mixer & Tumbler Forensics", category: "mixer", similarity: 0.78 },
      { title: "Quantum Vulnerability Assessment", category: "quantum", similarity: 0.71 },
    ],
    txSignature: "5Kp7r9dQZjN3xVc8bF2mLhT4yWqGpA1nE6sJxYbCfRz9HmKvLqW3pXyU8aBdNeF",
    explorerUrl:
      "https://explorer.solana.com/tx/5Kp7r9dQZjN3xVc8bF2mLhT4yWqGpA1nE6sJxYbCfRz9HmKvLqW3pXyU8aBdNeF?cluster=devnet",
    reportHash: "0x8f4a9c2d7e1b3f6a0c5d8e9b2a4f7c1d6e3b9a8f5c2d7e1b4a6f9c3d8e2b5a7",
  };
}

export const SOLANA_ADDRESS_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
export const isLikelySolanaAddress = (s: string) => SOLANA_ADDRESS_REGEX.test(s);
