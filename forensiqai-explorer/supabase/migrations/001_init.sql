create extension if not exists vector;

create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid (),
  content text not null,
  metadata jsonb default '{}',
  embedding vector (384),
  created_at timestamptz default now()
);

create table if not exists investigation_reports (
  id uuid primary key default gen_random_uuid (),
  wallet_address text not null,
  chain text default 'solana',
  risk_level text,
  confidence int,
  summary text,
  full_report text,
  tx_signature text,
  solana_explorer_url text,
  created_at timestamptz default now()
);

create table if not exists threat_submissions (
  id uuid primary key default gen_random_uuid (),
  wallet_address text not null,
  chain text default 'solana',
  threat_type text,
  description text,
  submitter_ip text,
  votes_up int default 0,
  votes_down int default 0,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists blacklisted_wallets (
  id uuid primary key default gen_random_uuid (),
  wallet_address text unique not null,
  chain text default 'solana',
  threat_type text,
  added_at timestamptz default now()
);

create index if not exists knowledge_documents_embedding_idx on knowledge_documents using ivfflat (embedding vector_cosine_ops)
with
  (lists = 100);

create or replace function match_documents (
  query_embedding vector (384),
  match_threshold float,
  match_count int
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
) language sql stable as $$
  select id, content, metadata,
    1 - (embedding <=> query_embedding) as similarity
  from knowledge_documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;