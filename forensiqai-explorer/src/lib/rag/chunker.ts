import { estimateTokens } from './tokenizer';
import { Chunk } from './types';

export interface ChunkOptions {
  chunkSizeTokens?: number; // target tokens per chunk
  overlapTokens?: number; // tokens to overlap between chunks
  maxCharsPerChunk?: number; // fallback char-based limit
}

export async function chunkText(text: string, opts: ChunkOptions = {}): Promise<Chunk[]> {
  const chunkSizeTokens = opts.chunkSizeTokens ?? 512;
  const overlapTokens = opts.overlapTokens ?? 64;
  const maxCharsPerChunk = opts.maxCharsPerChunk ?? 3000;

  // Simple sentence splitter
  const sentences = text.match(/[^\n]+(\n|$)/g) || [text];

  const chunks: Chunk[] = [];
  let buffer = '';
  let tokenCountBuffer = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const trial = buffer ? buffer + '\n' + sentence : sentence;
    const tokens = await estimateTokens(trial);
    if (tokens <= chunkSizeTokens && trial.length <= maxCharsPerChunk) {
      buffer = trial;
      tokenCountBuffer = tokens;
      continue;
    }

    if (buffer) {
      chunks.push({ chunkIndex: chunkIndex++, text: buffer.trim(), tokenCount: tokenCountBuffer });
      // create overlap: take last N chars of buffer to seed next chunk
      const overlapApprox = Math.min(buffer.length, Math.floor((overlapTokens / Math.max(1, tokenCountBuffer)) * buffer.length));
      buffer = buffer.slice(-overlapApprox).trim();
      tokenCountBuffer = await estimateTokens(buffer);
    }

    // if sentence itself is larger than chunk, break it by chars
    if (await estimateTokens(sentence) > chunkSizeTokens || sentence.length > maxCharsPerChunk) {
      let pos = 0;
      while (pos < sentence.length) {
        const slice = sentence.slice(pos, pos + maxCharsPerChunk);
        const sTokens = await estimateTokens(slice);
        chunks.push({ chunkIndex: chunkIndex++, text: slice.trim(), tokenCount: sTokens });
        pos += Math.max(1, maxCharsPerChunk - Math.floor((overlapTokens / chunkSizeTokens) * maxCharsPerChunk));
      }
      buffer = '';
      tokenCountBuffer = 0;
    } else {
      buffer = sentence.trim();
      tokenCountBuffer = await estimateTokens(buffer);
    }
  }

  if (buffer) {
    chunks.push({ chunkIndex: chunkIndex++, text: buffer.trim(), tokenCount: tokenCountBuffer });
  }

  return chunks;
}
