import { getConnection } from './solanaClient';
import { MEMO_PROGRAM_ID } from './types';

export async function verifyReportInTransaction(signature: string, expectedHash?: string) {
  const conn = getConnection();
  const tx = await conn.getParsedTransaction(signature, { commitment: 'confirmed' });
  if (!tx) return { ok: false, reason: 'transaction_not_found' };

  const instructions = tx.transaction.message.instructions as any[] ?? [];
  for (const inst of instructions) {
    const pid = inst.programId?.toString?.() ?? inst.programId;
    if (pid === MEMO_PROGRAM_ID) {
      // memo may be in parsed or raw
      const memoData = inst.parsed?.data ?? inst.data ?? null;
      if (!memoData) continue;
      const containsHash = expectedHash ? memoData.includes(expectedHash) : true;
      return { ok: containsHash, memo: memoData };
    }
  }

  return { ok: false, reason: 'no_memo' };
}
