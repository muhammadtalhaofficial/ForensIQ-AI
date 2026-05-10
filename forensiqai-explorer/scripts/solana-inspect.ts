#!/usr/bin/env ts-node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { analyzeWallet } from '../src/lib/solana/analyzer';
import { storeReportOnChain } from '../src/lib/solana/memoStore';

async function main() {
  const argv = yargs(hideBin(process.argv)).options({
    wallet: { type: 'string', demandOption: true },
    store: { type: 'boolean', default: false },
    maxRecords: { type: 'number', default: 1000 },
  }).parseSync();

  const wallet = String(argv.wallet);
  console.log('Analyzing wallet', wallet);
  const report = await analyzeWallet(wallet, { maxRecords: Number(argv.maxRecords) });
  console.log('Report:', JSON.stringify(report, null, 2));

  if (argv.store) {
    console.log('Storing report hash on-chain using Memo program...');
    const res = await storeReportOnChain(report);
    console.log('Stored on-chain:', res);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
