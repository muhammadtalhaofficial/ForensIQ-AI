import type { NextApiRequest, NextApiResponse } from 'next';
import { semanticSearch } from '../../../lib/rag/retriever';
import { buildRagContext, composePrompt } from '../../../lib/rag/contextBuilder';
import { embedTexts } from '../../../lib/rag/openai';
import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
const GROQ_FALLBACK_MODEL = process.env.GROQ_FALLBACK_MODEL || 'gpt-4o-mini';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { query: q, topK = 8, filters = {}, callLLM = false, maxContextTokens = 1600 } = req.body;
    if (!q) return res.status(400).json({ error: 'query required' });

    const results = await semanticSearch(q, { topK, ...(filters || {}) });

    // Map to context items and build RAG context
    const items = results.map((r: any) => ({
      embeddingId: r.embeddingId,
      documentId: r.documentId,
      chunkIndex: r.chunkIndex,
      snippet: r.snippet,
      tokenCount: r.tokenCount,
      model: r.model,
      dimension: r.dimension,
      score: r.score,
      document: r.document,
    }));

    const context = await buildRagContext(items, { maxTokens: maxContextTokens });

    if (callLLM) {
      if (!GROQ_API_KEY) return res.status(500).json({ error: 'Missing GROQ_API_KEY for LLM call' });
      const prompt = composePrompt(q, context);
      const groq = new Groq({ apiKey: GROQ_API_KEY });
      let payload: any = null;
      try {
        payload = await groq.chat.completions.create({ model: GROQ_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 800 });
      } catch (e: any) {
        console.warn('Groq primary model failed, trying fallback:', e?.message ?? e);
        try {
          payload = await groq.chat.completions.create({ model: GROQ_FALLBACK_MODEL, messages: [{ role: 'user', content: prompt }], max_tokens: 800 });
        } catch (e2: any) {
          console.error('Groq fallback failed:', e2?.message ?? e2);
          return res.status(500).json({ error: 'Groq completion failed' });
        }
      }

      return res.status(200).json({ answer: payload, context, results });
    }

    return res.status(200).json({ context, results });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}
