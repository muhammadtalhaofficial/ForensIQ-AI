import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { chunkText } from './chunker';
import { embedTexts } from './openai';
import { upsertDocument, insertEmbeddings, getDocumentByHash } from './store';
import { KnowledgeDocument, Chunk, IngestResult, EMBEDDING_DIM } from './types';

async function parseMarkdown(content: string) {
  try {
    const matter = await import('gray-matter');
    return matter.default(content);
  } catch (e) {
    return { content, data: {} } as any;
  }
}

async function parsePDF(buffer: Buffer) {
  try {
    const pdfParse = await import('pdf-parse');
    const data = await pdfParse.default(buffer);
    return data.text;
  } catch (e) {
    // fallback: return empty
    return '';
  }
}

export async function ingestFile(filePath: string, opts: { chunkTokens?: number; overlapTokens?: number } = {}): Promise<IngestResult> {
  const ext = path.extname(filePath).toLowerCase();
  const raw = await fs.readFile(filePath);
  let content = '';
  let metadata: any = {};
  let title = path.basename(filePath);

  if (ext === '.md' || ext === '.markdown') {
    const parsed = await parseMarkdown(raw.toString('utf-8'));
    content = parsed.content;
    metadata = parsed.data || {};
    title = metadata.title || title;
  } else if (ext === '.pdf') {
    content = await parsePDF(raw);
  } else {
    content = raw.toString('utf-8');
  }

  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const existing = await getDocumentByHash(hash);
  if (existing) {
    return { documentId: existing.id as string, chunksInserted: 0, skippedDuplicate: true };
  }

  const doc: KnowledgeDocument = {
    title,
    content,
    metadata,
    hash,
  };

  const documentId = await upsertDocument(doc);

  // chunk content
  const chunks: Chunk[] = await chunkText(content, { chunkSizeTokens: opts.chunkTokens ?? 512, overlapTokens: opts.overlapTokens ?? 64 });

  // generate embeddings in batches
  const texts = chunks.map((c) => c.text);
  const embeddings = await embedTexts(texts, 16);

  // map to embedding rows and store
  const rows = embeddings.map((emb, i) => ({
    document_id: documentId,
    chunk_index: chunks[i].chunkIndex,
    content_snippet: chunks[i].text,
    token_count: chunks[i].tokenCount,
    model: 'text-embedding-3-small',
    dimension: EMBEDDING_DIM,
    embedding: emb,
  })) as any;

  await insertEmbeddings(documentId, rows);
  return { documentId, chunksInserted: rows.length };
}
