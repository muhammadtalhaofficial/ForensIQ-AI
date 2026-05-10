import { getConnection, loadKeypairFromEnv, sendMemo } from './solanaClient';
import { ForensicReport } from './types';

export async function storeReportOnChain(report: ForensicReport, opts: { payerKeypair?: any } = {}) {
  const connection = getConnection();
  const payer = opts.payerKeypair ?? (await loadKeypairFromEnv());
  const memo = JSON.stringify({ type: 'forensiq_report', wallet: report.wallet, hash: report.reportHash, riskScore: report.riskScore, timestamp: report.analyzedAt });
  const sig = await sendMemo(connection, payer, memo);
  report.memoTxSignature = sig;
  return { signature: sig, memo };
}
