import { query } from './supabasePool';
import { KnowledgeDocument, EmbeddingRow, EMBEDDING_DIM } from './types';
import { vectorToPgLiteral } from './openai';

export async function getDocumentByHash(hash: string): Promise<KnowledgeDocument | null> {
  const sql = `SELECT * FROM knowledge_documents WHERE hash = $1 LIMIT 1`;
  const res = await query<KnowledgeDocument>(sql, [hash]);
  return res.rows[0] ?? null;
}

export async function upsertDocument(doc: KnowledgeDocument): Promise<string> {
  // simple insert; if hash exists return existing id
  if (doc.hash) {
    const existing = await getDocumentByHash(doc.hash);
    if (existing) return existing.id as string;
  }

  const sql = `INSERT INTO knowledge_documents (title, content, content_summary, source_id, category_id, severity, chain_label, threat_actor_id, metadata, hash)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`;
  const params = [doc.title || null, doc.content, doc.content_summary || null, doc.source_id || null, doc.category_id || null, doc.severity || null, doc.chain_label || null, doc.threat_actor_id || null, doc.metadata || null, doc.hash || null];
  const res = await query<{ id: string }>(sql, params);
  return res.rows[0].id;
}

export async function insertEmbeddings(documentId: string, rows: Array<Omit<EmbeddingRow, 'id' | 'document_id'>>): Promise<number> {
  if (!rows.length) return 0;

  const valuesSql: string[] = [];
  const params: any[] = [];
  let idx = 1;
  for (const r of rows) {
    params.push(documentId, r.chunk_index, r.content_snippet, vectorToPgLiteral(r.embedding), r.model, r.dimension, r.token_count);
    // ($1,$2,$3,$4::vector(1536),$5,$6,$7)
    valuesSql.push(`($${idx}, $${idx + 1}, $${idx + 2}, $${idx + 3}::vector(${EMBEDDING_DIM}), $${idx + 4}, $${idx + 5}, $${idx + 6})`);
    idx += 7;
  }

  const sql = `INSERT INTO embeddings (document_id, chunk_index, content_snippet, embedding, model, dimension, token_count) VALUES ${valuesSql.join(',')}`;
  await query(sql, params);
  return rows.length;
}
