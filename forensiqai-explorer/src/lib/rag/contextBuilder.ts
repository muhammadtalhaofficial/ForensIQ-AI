import { estimateTokens } from './tokenizer';
import { RagContextItem } from './types';

export interface ContextBuilderOptions {
  maxTokens?: number; // token budget for context
}

export async function buildRagContext(items: RagContextItem[], opts: ContextBuilderOptions = {}): Promise<string> {
  const maxTokens = opts.maxTokens ?? 1800;
  // sort by score desc
  const sorted = items.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  const blocks: string[] = [];
  let usedTokens = 0;

  for (let i = 0; i < sorted.length; i++) {
    const it = sorted[i];
    const header = `[KNOWLEDGE ${i + 1}]\nTITLE: ${it.document?.title || 'Unknown'}\nCATEGORY: ${it.document?.metadata?.category || 'Unknown'}\nSCORE: ${Number(it.score ?? 0).toFixed(4)}\n`;
    const body = it.snippet || it.document?.content || '';
    const content = `CONTENT: ${body}\n`;
    const block = header + content;
    const t = await estimateTokens(block);
    if (usedTokens + t > maxTokens) break;
    blocks.push(block);
    usedTokens += t;
  }

  return blocks.join('\n');
}

export function composePrompt(investigation: string, context: string, instructions?: string) {
  const inst = instructions ?? `You are a forensic blockchain analyst. Use the context to answer the user's query, cite evidence blocks by their KNOWLEDGE index, and list confidence for each claim.`;
  return `${inst}\n\nCONTEXT:\n${context}\n\nINQUIRY:\n${investigation}\n\nRESPONSE:`;
}
