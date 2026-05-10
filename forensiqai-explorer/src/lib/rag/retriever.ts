import { createClient } from '@supabase/supabase-js';
import { embedTexts } from './openai';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, key);
}

export interface SearchOptions {
  topK?: number;
  threshold?: number;
}

export async function semanticSearch(queryText: string, opts: SearchOptions = {}) {
  const topK = opts.topK ?? 10;
  const threshold = opts.threshold ?? 0.3;

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return [];
    }
    const embeddings = await embedTexts([queryText]);
    const embedding = embeddings[0];

    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: topK,
    });

    if (error) throw error;

    return (data || []).map((r: any) => ({
      document: { title: r.metadata?.title || 'Unknown', content: r.content, metadata: r.metadata },
      score: r.similarity,
    }));
  } catch (err) {
    console.error('Semantic search failed:', err);
    return [];
  }
}
