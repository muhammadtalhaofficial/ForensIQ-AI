import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import { embedTexts } from '../src/lib/rag/openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DOCUMENTS = [
  {
    title: 'Rug Pull Pattern Recognition',
    category: 'rug_pull',
    content: `Rug pull attacks involve developers abandoning a project after accumulating investor funds. Key on-chain signals include: sudden removal of liquidity from DEX pools (often 90-100% in a single transaction), rapid transfer of treasury funds to a new wallet immediately after, contract ownership renounced or transferred to a burn address after the pull, social channels deleted within hours. Soft rugs show gradual liquidity removal over days. Hard rugs happen in one transaction. Exit scams involve the team selling all tokens before announcement. Watch for: deployer wallet receiving large transfers from project treasury, LP tokens being burned or transferred out, token mint authority being used to mint large supply to team wallets.`
  },
  {
    title: 'Flash Loan Attack Signatures',
    category: 'flash_loan',
    content: `Flash loan attacks execute in a single transaction block. Forensic indicators: one transaction touching 4+ protocols in sequence, abnormally high compute units used (near block limit), oracle price manipulation visible as sudden price spike then reversal within same block, attacker address is freshly created (0-2 prior transactions), funds returned to attacker wallet minus profit within same transaction. Known examples: Harvest Finance lost $34M when attacker manipulated USDC/USDT price on Curve. Mango Markets lost $116M via oracle price manipulation of MNGO token. After the attack, funds typically bridge to Ethereum within hours via Wormhole or Allbridge.`
  },
  {
    title: 'Phishing Wallet Drainer Patterns',
    category: 'phishing',
    content: `Wallet drainers are scripts that trick users into signing malicious transactions. On-chain forensic signals: multiple victim wallets sending funds to the same address within a 10-60 minute window (coordinated drain), use of setApprovalForAll to gain token approval before draining, drainer wallet interacts with victims then immediately forwards to aggregator address, victim wallets show no prior interaction with drainer. Known drainer families: Inferno Drainer (uses create2 for fresh addresses each campaign), MS Drainer (sold as SaaS on Telegram), Angel Drainer (targets high-value NFT holders). Drainer wallets are typically used for 24-72 hours then abandoned. Funds route through Jupiter or Raydium swaps within minutes.`
  },
  {
    title: 'Mixer and Tumbler Usage Detection',
    category: 'mixer',
    content: `Mixers obscure transaction trails by pooling and redistributing funds. Detection signals: transactions to known mixer program addresses, deposits in round denominations (1 SOL, 5 SOL, 10 SOL exactly), time delays of 1-48 hours between deposit and withdrawal, funds emerge from fresh wallet with no prior history, chain-hopping via bridges (Solana to Ethereum via Wormhole then Tornado Cash). Solana-specific obfuscation: rapid DEX swaps across 3+ pools to break the trail, use of multiple intermediate wallets each holding funds briefly, conversion to stablecoins then back to SOL. After mixing, funds typically consolidate into a single withdrawal wallet before being sent to a centralized exchange for cashout.`
  },
  {
    title: 'Quantum Vulnerability Assessment for Solana Wallets',
    category: 'quantum_risk',
    content: `Solana uses Ed25519 signatures. Every time a wallet signs a transaction, its public key is exposed on-chain. When sufficiently powerful quantum computers arrive (estimated 2030-2035), attackers could derive private keys from exposed public keys using Shor's algorithm. Project Eleven completed a formal assessment with the Solana Foundation in December 2025 confirming this risk. Risk tiers by transaction count: 0 transactions (public key never exposed) = no risk; 1-10 transactions = low risk; 11-50 transactions = medium risk; 51+ transactions = high risk. Recommended mitigation: generate a fresh wallet that has never signed a transaction, transfer all assets to it, and never use the old address again. Wallets that have only received funds but never sent are safe because they have never exposed their public key.`
  },
  {
    title: 'Ronin Bridge Hack Post-Mortem',
    category: 'exploit',
    content: `The Ronin Bridge hack in March 2022 resulted in $625M stolen, the largest crypto hack in history. Attack vector: the attacker (Lazarus Group, North Korea) compromised 5 of 9 Ronin validator nodes. Four were controlled by Sky Mavis, one by Axie DAO which had granted Sky Mavis temporary signing permission that was never revoked. The attacker used the 5 signatures to authorize two fraudulent withdrawals: 173,600 ETH and 25.5M USDC. On-chain forensic trail: funds moved from Ronin bridge contract to attacker EOA, then split across multiple wallets, then mixed via Tornado Cash over weeks, then OTC sold to buyers in Asia. The hack went undetected for 6 days until a user reported they could not withdraw. Lesson: validator key compromise enables bridge draining without any smart contract exploit.`
  },
];

async function ingest() {
  console.log('Starting RAG knowledge base ingestion using Local Transformers (Free & Offline)...\n');

  // Embed all at once
  const texts = DOCUMENTS.map(d => d.content);
  let embeddings: number[][] = [];
  try {
    embeddings = await embedTexts(texts);
    console.log(`✓ Generated ${embeddings.length} embeddings locally`);
  } catch (err) {
    console.error('✗ Failed to generate embeddings:', err);
    return;
  }

  for (let i = 0; i < DOCUMENTS.length; i++) {
    const doc = DOCUMENTS[i];
    const embedding = embeddings[i];

    try {
      const { error } = await supabase.from('knowledge_documents').insert({
        content: doc.content,
        metadata: { title: doc.title, category: doc.category },
        embedding,
      });

      if (error) throw error;
      console.log(`✓ Ingested: ${doc.title}`);
    } catch (err) {
      console.log(`✗ Failed: ${doc.title}`, err);
    }
  }

  console.log('\nDone. Knowledge base ready.');
}

ingest();