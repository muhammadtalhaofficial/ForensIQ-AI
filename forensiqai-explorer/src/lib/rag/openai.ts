import { pipeline } from '@xenova/transformers';

let extractor: any = null;

async function getExtractor() {
  if (!extractor) {
    // Model is downloaded once (~80MB) and cached locally.
    // 'Xenova/all-MiniLM-L6-v2' returns 384 dimensions.
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const generateEmbedding = await getExtractor();
  const results: number[][] = [];
  
  for (const text of texts) {
    // pooling: 'mean' and normalize: true are standard for sentence embeddings
    const output = await generateEmbedding(text, { pooling: 'mean', normalize: true });
    results.push(Array.from(output.data) as number[]);
  }
  
  return results;
}

/**
 * Convert a numeric vector to a Postgres pgvector literal string, e.g. '[0.1,0.2]'
 */
export function vectorToPgLiteral(vec: number[]) {
  return '[' + vec.map((n) => Number(n).toPrecision(10)).join(',') + ']';
}
