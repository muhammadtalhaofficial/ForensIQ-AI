import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import fs from 'fs/promises';
import path from 'path';
import { MEMO_PROGRAM_ID } from './types';

export function getConnection(): Connection {
  const url = process.env.SOLANA_RPC_URL || (process.env.SOLANA_NETWORK === 'devnet' ? 'https://api.devnet.solana.com' : 'https://api.mainnet-beta.solana.com');
  return new Connection(url, { commitment: 'confirmed' });
}

export async function loadKeypairFromEnv(): Promise<Keypair> {
  const v = process.env.SOLANA_KEYPAIR;
  if (!v) throw new Error('Missing SOLANA_KEYPAIR environment variable (path to JSON keypair or JSON array)');
  // If it's a path
  try {
    if (v.startsWith('.') || v.startsWith('/') || v.match(/^[A-Za-z]:\\/)) {
      const p = path.isAbsolute(v) ? v : path.resolve(process.cwd(), v);
      const raw = await fs.readFile(p, 'utf-8');
      const arr = JSON.parse(raw);
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
  } catch (e) {
    // not a path or failed; try parsing as JSON
  }

  try {
    const arr = JSON.parse(v);
    if (Array.isArray(arr)) return Keypair.fromSecretKey(Uint8Array.from(arr));
  } catch (e) {
    // fallthrough
  }

  throw new Error('Unsupported SOLANA_KEYPAIR format. Use JSON array or path to keypair file.');
}

export async function sendMemo(connection: Connection, payer: Keypair, memoText: string) {
  const memoProgramId = new PublicKey(MEMO_PROGRAM_ID);
  const data = Buffer.from(memoText);
  const instruction = new TransactionInstruction({ keys: [], programId: memoProgramId, data });

  const recent = await connection.getLatestBlockhash('finalized');
  const tx = new Transaction({ feePayer: payer.publicKey, recentBlockhash: recent.blockhash });
  tx.add(instruction);
  tx.sign(payer);
  const raw = tx.serialize();
  const sig = await connection.sendRawTransaction(raw, { skipPreflight: false });
  await connection.confirmTransaction(sig, 'confirmed');
  return sig;
}
