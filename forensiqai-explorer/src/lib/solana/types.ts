export const MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

export interface TransactionRecord {
  signature: string;
  slot?: number;
  blockTime?: number | null;
  raw?: any;
}

export interface Counterparty {
  address: string;
  transfers: number;
  totalAmount: number; // lamports
  score?: number;
  reasons?: string[];
}

export interface ForensicSignals {
  rapidDraining: boolean;
  mixerInteraction: boolean;
  bridgeHopping: boolean;
  washTrading: boolean;
  dormantActivation: boolean;
  flashAttack: boolean;
}

export interface ForensicReport {
  wallet: string;
  analyzedAt: string; // ISO
  txCount: number;
  totalIncoming: number; // lamports
  totalOutgoing: number; // lamports
  largestOutgoing: number; // lamports
  counterparties: Counterparty[];
  signals: ForensicSignals;
  riskScore: number; // 0..1
  confidence: number; // 0..1
  metadata?: Record<string, any>;
  reportHash?: string; // SHA-256 hex
  memoTxSignature?: string;
}
