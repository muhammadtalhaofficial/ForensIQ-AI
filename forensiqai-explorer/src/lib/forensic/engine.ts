import {
  DetectionCategory,
  ForensicEngineConfig,
  ForensicHeuristicResult,
  ForensicRiskScore,
  ForensicReport,
  ForensicEvidence,
  QuantumVulnerability,
  TxRecord,
} from './types';
import { ALL_HEURISTICS, HeuristicFn } from './heuristics';

export class ForensicEngine {
  config: ForensicEngineConfig;
  constructor(config: ForensicEngineConfig) {
    this.config = config;
  }

  async analyzeWallet(wallet: string, txHistory: TxRecord[]): Promise<ForensicReport> {
    // 1. Run all enabled heuristics
    const heuristics: ForensicHeuristicResult[] = Object.entries(ALL_HEURISTICS)
      .filter(([cat, fn]) => this.config.heuristics?.[cat as DetectionCategory]?.enabled !== false)
      .map(([cat, fn]) => fn(wallet, txHistory, this.config));

    // 2. Aggregate evidence
    const evidence: ForensicEvidence[] = heuristics
      .filter(h => h.triggered)
      .map(h => ({
        category: h.category,
        summary: h.evidence[0] || 'Heuristic triggered',
        evidence: h.evidence,
        confidence: h.confidence,
      }));

    // 3. Risk scoring (simple example, expand as needed)
    const risk = this.scoreRisk(heuristics, wallet, txHistory);

    // 4. Quantum vulnerability (placeholder)
    const quantum = this.quantumVulnerability(wallet, txHistory);

    // 5. Build report
    const report: ForensicReport = {
      wallet,
      risk,
      heuristics,
      quantum,
      evidence,
      markdownSummary: this.buildMarkdownSummary(wallet, risk, heuristics, evidence, quantum),
      executiveSummary: this.buildExecutiveSummary(wallet, risk, heuristics, evidence, quantum),
      recommendations: this.buildRecommendations(risk, heuristics, quantum),
      timeline: [],
      relatedWallets: [],
      clusters: [],
      confidence: risk.confidence,
    };
    return report;
  }

  scoreRisk(heuristics: ForensicHeuristicResult[], wallet: string, txHistory: TxRecord[]): ForensicRiskScore {
    // Example: aggregate triggered heuristics
    const triggered = heuristics.filter(h => h.triggered);
    let score = triggered.reduce((acc, h) => acc + h.confidence, 0);
    let level: ForensicRiskScore['level'] = 'low';
    if (score > 2) level = 'medium';
    if (score > 4) level = 'high';
    if (score > 7) level = 'critical';
    return {
      level,
      score,
      confidence: Math.min(1, score / 10),
      reasoning: triggered.map(h => `${h.category}: ${h.evidence.join('; ')}`),
    };
  }

  quantumVulnerability(wallet: string, txHistory: TxRecord[]): QuantumVulnerability {
    // Placeholder: count Ed25519 signatures, exposure
    return {
      ed25519Exposure: 0,
      signatureCount: 0,
      quantumRiskTier: 'low',
      exposureScore: 0,
    };
  }

  buildMarkdownSummary(
    wallet: string,
    risk: ForensicRiskScore,
    heuristics: ForensicHeuristicResult[],
    evidence: ForensicEvidence[],
    quantum: QuantumVulnerability
  ): string {
    return [
      `# Forensic Report for ${wallet}`,
      `**Risk Level:** ${risk.level} (Score: ${risk.score.toFixed(2)})`,
      '',
      '## Triggered Heuristics:',
      ...evidence.map(e => `- **${e.category}**: ${e.summary} (Confidence: ${(e.confidence * 100).toFixed(1)}%)`),
      '',
      '## Quantum Vulnerability:',
      `- Exposure: ${quantum.ed25519Exposure}, Signatures: ${quantum.signatureCount}, Tier: ${quantum.quantumRiskTier}`,
      '',
      '## Recommendations:',
      ...this.buildRecommendations(risk, heuristics, quantum).map(r => `- ${r}`),
    ].join('\n');
  }

  buildExecutiveSummary(
    wallet: string,
    risk: ForensicRiskScore,
    heuristics: ForensicHeuristicResult[],
    evidence: ForensicEvidence[],
    quantum: QuantumVulnerability
  ): string {
    return `Wallet ${wallet} is assessed as ${risk.level.toUpperCase()} risk. ${evidence.length} threat indicators triggered. Quantum risk: ${quantum.quantumRiskTier}.`;
  }

  buildRecommendations(
    risk: ForensicRiskScore,
    heuristics: ForensicHeuristicResult[],
    quantum: QuantumVulnerability
  ): string[] {
    const recs: string[] = [];
    if (risk.level === 'high' || risk.level === 'critical') recs.push('Immediate investigation recommended.');
    if (quantum.quantumRiskTier !== 'low') recs.push('Rotate keys to quantum-resistant scheme.');
    if (heuristics.some(h => h.category === 'mixer_laundering' && h.triggered)) recs.push('Check for laundering via mixers.');
    if (heuristics.some(h => h.category === 'phishing_drainer' && h.triggered)) recs.push('Warn user of phishing risk.');
    if (recs.length === 0) recs.push('No immediate action required.');
    return recs;
  }
}
