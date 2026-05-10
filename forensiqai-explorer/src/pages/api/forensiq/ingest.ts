import type { NextApiRequest, NextApiResponse } from 'next';
import { chunkText } from '../../../lib/rag/chunker';
import { embedTexts } from '../../../lib/rag/openai';
import { upsertDocument, insertEmbeddings } from '../../../lib/rag/store';
import { EMBEDDING_DIM } from '../../../lib/rag/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { title, content, metadata, chunkTokens = 512, overlapTokens = 64 } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });

    const docId = await upsertDocument({ title, content, metadata });
    const chunks = await chunkText(content, { chunkSizeTokens: chunkTokens, overlapTokens });
    const texts = chunks.map((c) => c.text);
    const embs = await embedTexts(texts, 16);

    const rows = embs.map((v, i: number) => ({
      document_id: docId,
      chunk_index: chunks[i].chunkIndex,
      content_snippet: chunks[i].text,
      token_count: chunks[i].tokenCount,
      model: 'text-embedding-3-small',
      dimension: EMBEDDING_DIM,
      embedding: v,
    })) as any;

    await insertEmbeddings(docId, rows);
    return res.status(201).json({ documentId: docId, chunks: rows.length });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: String(err.message || err) });
  }
}
