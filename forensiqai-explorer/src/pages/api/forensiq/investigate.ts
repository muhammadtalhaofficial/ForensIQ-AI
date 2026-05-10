import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchWalletBalance } from '../../../lib/solana/heliusClient';
import { analyzeWallet } from '../../../lib/solana/analyzer';
import { semanticSearch } from '../../../lib/rag/retriever';
import { buildRagContext } from '../../../lib/rag/contextBuilder';
import { storeReportOnChain } from '../../../lib/solana/memoStore';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { walletAddress } = req.body;
  if (!walletAddress) return res.status(400).json({ error: 'walletAddress required' });

  // 1. Fetch on-chain data & Run forensic heuristics
  const [balance, report] = await Promise.all([
    fetchWalletBalance(walletAddress),
    analyzeWallet(walletAddress, { maxRecords: 100 }),
  ]);
  const signals = report.signals;
  const txCount = report.txCount;

  // 3. RAG search based on detected signals
  const query = [
    signals.rapidDraining && 'phishing rapid drain wallet drainer',
    signals.mixerInteraction && 'mixer tumbler money laundering',
    signals.flashAttack && 'flash loan exploit signature',
  ].filter(Boolean).join(' ') || 'blockchain forensic investigation';

  const ragDocs = await semanticSearch(query, { topK: 6 });
  const ragContext = await buildRagContext(ragDocs);

  // 4. LLM analysis via Groq
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are ForensiqAI, an elite blockchain forensic investigator. Return only valid JSON with: riskLevel (low|medium|high|critical), confidence (0-100), summary (plain English, 2-3 sentences), fullReport (markdown with 5 sections: Overview, Transaction Patterns, Forensic Findings, Quantum Risk, Conclusion), patterns (array of {name, detected, detail}), relatedAddresses (string array).`
      },
      {
        role: 'user',
        content: `${ragContext}\n\nWallet: ${walletAddress}\nBalance: ${balance} SOL\nTransactions: ${txCount}\nTotal Volume: ${report.totalOutgoing} SOL\nRapid Drain: ${signals.rapidDraining}\nMixer Interaction: ${signals.mixerInteraction}\nUnique Counterparties: ${report.counterparties.length}\nInvestigate this wallet and return your forensic report as JSON.`
      }
    ]
  });

  const result = JSON.parse(completion.choices[0].message.content!);

  // 5. Store on-chain
  let txSignature, explorerUrl;
  try {
    const stored = await storeReportOnChain({
      wallet: walletAddress,
      riskScore: result.confidence,
      reportHash: '',  // hash result yourself
      analyzedAt: new Date().toISOString(),
    } as any);
    txSignature = stored.signature;
    explorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
  } catch (e) {
    // non-fatal, continue without on-chain storage
  }

  return res.status(200).json({
    success: true,
    result: {
      walletAddress,
      balance,
      transactionCount: txCount,
      totalVolumeSOL: report.totalOutgoing,
      uniqueCounterparties: report.counterparties.length,
      ...result,
      txSignature,
      explorerUrl,
      ragSources: ragDocs.map(d => ({ title: d.document.title, similarity: d.score }))
    }
  });
}