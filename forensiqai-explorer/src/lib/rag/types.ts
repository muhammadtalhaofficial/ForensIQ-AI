export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const EMBEDDING_DIM = 1536;

export type Severity = 'low' | 'medium' | 'high' | string;

export interface KnowledgeDocument {
  id?: string;
  title?: string;
  content: string;
  content_summary?: string;
  source_id?: string;
  category_id?: string;
  severity?: Severity;
  chain_label?: string;
  threat_actor_id?: string;
  metadata?: Record<string, any>;
  hash?: string;
  created_at?: string;
}

export interface Source {
  id?: string;
  name: string;
  url?: string;
  trust_score?: number; // 0..1
  details?: Record<string, any>;
}

export interface Category {
  id?: string;
  name: string;
  description?: string;
  parent_id?: string | null;
}

export interface ThreatActor {
  id?: string;
  name: string;
  attribution_confidence?: number;
  details?: Record<string, any>;
}

export interface EmbeddingRow {
  id?: string;
  document_id: string;
  chunk_index: number;
  content_snippet: string;
  token_count: number;
  model: string;
  dimension: number;
  embedding: number[];
  created_at?: string;
}

export interface Chunk {
  chunkIndex: number;
  text: string;
  tokenCount: number;
}

export interface IngestResult {
  documentId: string;
  chunksInserted: number;
  skippedDuplicate?: boolean;
}

export interface SearchFilters {
  categoryIds?: string[];
  chain?: string;
  severity?: Severity | Severity[];
  since?: string; // ISO date
  until?: string;
}

export interface RetrievalResult {
  embeddingId: string;
  documentId: string;
  chunkIndex: number;
  snippet: string;
  tokenCount: number;
  model: string;
  dimension: number;
  score: number; // normalized relevance score
  document?: KnowledgeDocument;
}

export interface RagContextItem extends RetrievalResult {
  category?: string;
  severity?: Severity;
  source?: string;
  confidence?: number;
}
