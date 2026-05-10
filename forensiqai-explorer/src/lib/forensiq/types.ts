export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ForensicPattern {
  name: string;
  detected: boolean;
  detail?: string;
}

export interface QuantumRisk {
  exposedPublicKeyCount: number;
  isAtRisk: boolean;
  recommendation: string;
}

export interface RagSource {
  title: string;
  category: string;
  similarity: number;
}

export interface InvestigationResult {
  walletAddress: string;
  chain: "solana" | "ethereum";
  riskLevel: RiskLevel;
  confidence: number;
  summary: string;
  fullReport: string; // markdown
  patterns: ForensicPattern[];
  relatedAddresses: string[];
  quantumRisk: QuantumRisk;
  transactionCount: number;
  firstSeen: string;
  lastSeen: string;
  totalVolumeSOL: number;
  uniqueCounterparties: number;
  ragSources: RagSource[];
  txSignature?: string;
  explorerUrl?: string;
  reportHash?: string;
}

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  result?: InvestigationResult;
  timestamp: number;
  isLoading?: boolean;
}
