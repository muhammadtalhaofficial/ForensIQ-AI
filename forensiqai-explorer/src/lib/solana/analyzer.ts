import { fetchAllTransactions } from './heliusClient';
import { sha256Hex } from './hash';
import { ForensicReport, Counterparty, ForensicSignals } from './types';
import { KNOWN_MIXERS } from './knownMixers';

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function identifyCounterpartyFromBalances(accountKeys: string[], pre: number[], post: number[], subjectIndex: number): string | null {
  // Heuristic: find the account with highest positive delta when subject had negative delta
  const deltas = post.map((p, i) => p - pre[i]);
  const subjectDelta = deltas[subjectIndex];
  if (subjectDelta >= 0) return null;
  let bestIndex: number | null = null;
  let bestVal = 0;
  for (let i = 0; i < deltas.length; i++) {
    if (i === subjectIndex) continue;
    if (deltas[i] > bestVal) {
      bestVal = deltas[i];
      bestIndex = i;
    }
  }
  if (bestIndex === null) return null;
  return accountKeys[bestIndex] ?? null;
}

export async function analyzeWallet(wallet: string, opts: { maxRecords?: number } = {}): Promise<ForensicReport> {
  const maxRecords = opts.maxRecords ?? 1000;
  const txs = await fetchAllTransactions(wallet, maxRecords);

  let totalIncoming = 0;
  let totalOutgoing = 0;
  let largestOutgoing = 0;
  const counterpartiesMap = new Map<string, Counterparty>();
  const now = nowSeconds();
  const twentyFourH = now - 24 * 3600;
  let outgoing24h = 0;

  for (const tx of txs) {
    const meta = tx.meta || tx.transaction?.meta || tx.meta?.err === undefined ? tx.meta : null;
    const message = tx.transaction?.message ?? tx.transaction?.message ?? null;
    const accountKeysRaw = message?.accountKeys ?? message?.accountKeys ?? [];
    const accountKeys = accountKeysRaw.map((k: any) => (typeof k === 'string' ? k : k.pubkey || k.pubkey?.toString()));

    const preBalances = meta?.preBalances ?? meta?.preBalances ?? [];
    const postBalances = meta?.postBalances ?? meta?.postBalances ?? [];

    const idx = accountKeys.findIndex((a: string) => a === wallet || a === wallet.toString());
    if (idx >= 0 && preBalances.length && postBalances.length && preBalances.length === postBalances.length) {
      const delta = postBalances[idx] - preBalances[idx];
      if (delta > 0) totalIncoming += delta; else if (delta < 0) {
        const out = -delta;
        totalOutgoing += out;
        if (out > largestOutgoing) largestOutgoing = out;
        // detect counterparty
        const cp = identifyCounterpartyFromBalances(accountKeys, preBalances, postBalances, idx) || 'unknown';
        const existing = counterpartiesMap.get(cp) || { address: cp, transfers: 0, totalAmount: 0, reasons: [] };
        existing.transfers += 1;
        existing.totalAmount += out;
        counterpartiesMap.set(cp, existing);

        if ((tx.blockTime ?? 0) >= twentyFourH) outgoing24h += out;
      }
    }
  }

  // build counterparties list
  const counterparties = Array.from(counterpartiesMap.values()).map((c) => {
    // score heuristics: frequency and amount
    const score = Math.min(1, (c.transfers / 10) * 0.4 + Math.min(1, c.totalAmount / Math.max(1, totalOutgoing)) * 0.6);
    return { ...c, score };
  });

  // signals heuristics
  const signals: ForensicSignals = {
    rapidDraining: totalOutgoing > 0 && (outgoing24h / Math.max(1, totalOutgoing)) > 0.6 && outgoing24h > 1e9,
    mixerInteraction: counterparties.some((c) => KNOWN_MIXERS.includes(c.address)),
    bridgeHopping: false, // requires bridge program detection (future)
    washTrading: false,
    dormantActivation: false,
    flashAttack: false,
  };

  // risk score: combine signals and largest outgoing
  let riskScore = 0;
  if (signals.rapidDraining) riskScore += 0.5;
  if (signals.mixerInteraction) riskScore += 0.25;
  riskScore += Math.min(0.25, largestOutgoing / Math.max(1, totalOutgoing + 1));
  riskScore = Math.min(1, riskScore);

  const report: ForensicReport = {
    wallet,
    analyzedAt: new Date().toISOString(),
    txCount: txs.length,
    totalIncoming,
    totalOutgoing,
    largestOutgoing,
    counterparties,
    signals,
    riskScore,
    confidence: 0.7, // baseline; could be computed from data quality
    metadata: { source: 'helius', recordsAnalyzed: txs.length },
  };

  // compute hash
  report.reportHash = sha256Hex(JSON.stringify(report));
  return report;
}
