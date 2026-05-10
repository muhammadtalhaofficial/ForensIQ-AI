import { ForensicEngine } from './engine';
import { ForensicEngineConfig, TxRecord } from './types';

// Example config with empty sets (replace with real data in production)
const config: ForensicEngineConfig = {
  maliciousWallets: new Set(),
  mixerAddresses: new Set(),
  bridgeContracts: new Set(),
  heuristics: {
    rug_pull: { enabled: true },
    flash_loan: { enabled: true },
    phishing_drainer: { enabled: true },
    mixer_laundering: { enabled: true },
    bridge_exploit: { enabled: true },
    oracle_manipulation: { enabled: true },
    wash_trading: { enabled: true },
    sybil_attack: { enabled: true },
    pump_and_dump: { enabled: true },
    honeypot: { enabled: true },
    dormant_activation: { enabled: true },
    coordinated_draining: { enabled: true },
    validator_compromise: { enabled: true },
  },
};

// Example wallet and tx history (replace with real data)
const wallet = 'ExampleWalletAddress';
const txHistory: TxRecord[] = [];

async function main() {
  const engine = new ForensicEngine(config);
  const report = await engine.analyzeWallet(wallet, txHistory);
  console.log(report.markdownSummary);
  console.log('\nExecutive Summary:', report.executiveSummary);
  console.log('\nRecommendations:', report.recommendations);
}

main();