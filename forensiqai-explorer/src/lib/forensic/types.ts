export type DetectionCategory =
  | 'rug_pull'
  | 'flash_loan'
  | 'phishing_drainer'
  | 'mixer_laundering'
  | 'bridge_exploit'
  | 'oracle_manipulation'
  | 'wash_trading'
  | 'sybil_attack'
  | 'pump_and_dump'
  | 'honeypot'
  | 'dormant_activation'
  | 'coordinated_draining'
  | 'validator_compromise';

export interface ForensicHeuristicResult {
  category: DetectionCategory;
  triggered: boolean;
  confidence: number; // 0..1
  evidence: string[];
  details?: Record<string, any>;
}

export interface ForensicEvidence {
  category: DetectionCategory;
  summary: string;
  evidence: string[];
  confidence: number;
}

export interface ForensicRiskFactors {
  txHistory: TxRecord[];
  knownMalicious: boolean;
  mixerExposure: boolean;
  burstDetected: boolean;
  launderingSimilarity: number;
  exploitFingerprint: boolean;
  walletAgeDays: number;
  exposureCount: number;
}

export interface TxRecord {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value?: number | string;
  tokenAddress?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  logs?: any[];
  raw?: any;
}

export interface ForensicRiskScore {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  confidence: number;
  reasoning: string[];
}

export interface QuantumVulnerability {
  ed25519Exposure: number;
  signatureCount: number;
  quantumRiskTier: 'low' | 'medium' | 'high';
  exposureScore: number;
}

export interface ForensicReport {
  wallet: string;
  risk: ForensicRiskScore;
  heuristics: ForensicHeuristicResult[];
  quantum: QuantumVulnerability;
  evidence: ForensicEvidence[];
  markdownSummary: string;
  executiveSummary: string;
  recommendations: string[];
  timeline: string[];
  relatedWallets: string[];
  clusters: string[][];
  confidence: number;
}

export interface ForensicEngineConfig {
  maliciousWallets: Set<string>;
  mixerAddresses: Set<string>;
  bridgeContracts: Set<string>;
  heuristics?: Partial<Record<DetectionCategory, { enabled: boolean; threshold?: number }>>;
}
