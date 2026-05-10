import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
];

async function test() {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert({
      title: DOCUMENTS[0].title,
      content: DOCUMENTS[0].content,
    })
    .select();

  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
