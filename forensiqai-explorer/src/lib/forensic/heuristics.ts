import { DetectionCategory, ForensicHeuristicResult, ForensicEngineConfig, TxRecord } from './types';

// Heuristic function signature
export type HeuristicFn = (
  wallet: string,
  txHistory: TxRecord[],
  config: ForensicEngineConfig
) => ForensicHeuristicResult;

// Example: Rug Pull detection
export const rugPullHeuristic: HeuristicFn = (wallet, txs, config) => {
  // Detects mass sell-off, liquidity removal, dev withdrawal
  let triggered = false;
  let evidence: string[] = [];
  let confidence = 0.0;
  // ...detection logic placeholder...
  // Example: if >80% of token supply sold in 1hr
  // ...
  return {
    category: 'rug_pull',
    triggered,
    confidence,
    evidence,
  };
};

// Example: Flash Loan detection
export const flashLoanHeuristic: HeuristicFn = (wallet, txs, config) => {
  // Detects rapid borrow/repay cycles
  let triggered = false;
  let evidence: string[] = [];
  let confidence = 0.0;
  // ...detection logic placeholder...
  return {
    category: 'flash_loan',
    triggered,
    confidence,
    evidence,
  };
};

// ...repeat for all categories (phishing, mixer, bridge, oracle, wash, sybil, etc)...

export const ALL_HEURISTICS: Record<DetectionCategory, HeuristicFn> = {
  rug_pull: rugPullHeuristic,
  flash_loan: flashLoanHeuristic,
  phishing_drainer: (w, t, c) => ({ category: 'phishing_drainer', triggered: false, confidence: 0, evidence: [] }),
  mixer_laundering: (w, t, c) => ({ category: 'mixer_laundering', triggered: false, confidence: 0, evidence: [] }),
  bridge_exploit: (w, t, c) => ({ category: 'bridge_exploit', triggered: false, confidence: 0, evidence: [] }),
  oracle_manipulation: (w, t, c) => ({ category: 'oracle_manipulation', triggered: false, confidence: 0, evidence: [] }),
  wash_trading: (w, t, c) => ({ category: 'wash_trading', triggered: false, confidence: 0, evidence: [] }),
  sybil_attack: (w, t, c) => ({ category: 'sybil_attack', triggered: false, confidence: 0, evidence: [] }),
  pump_and_dump: (w, t, c) => ({ category: 'pump_and_dump', triggered: false, confidence: 0, evidence: [] }),
  honeypot: (w, t, c) => ({ category: 'honeypot', triggered: false, confidence: 0, evidence: [] }),
  dormant_activation: (w, t, c) => ({ category: 'dormant_activation', triggered: false, confidence: 0, evidence: [] }),
  coordinated_draining: (w, t, c) => ({ category: 'coordinated_draining', triggered: false, confidence: 0, evidence: [] }),
  validator_compromise: (w, t, c) => ({ category: 'validator_compromise', triggered: false, confidence: 0, evidence: [] }),
};
