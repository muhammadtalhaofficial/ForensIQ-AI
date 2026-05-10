import { Pool } from 'pg';

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing SUPABASE_DB_URL or DATABASE_URL environment variable');
}

const pool = new Pool({
  connectionString,
  // Supabase often requires SSL; allow override via env
  ssl: process.env.SUPABASE_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  // keep connection pool conservative for serverless setups
  max: Number(process.env.PG_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number }> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount };
  } finally {
    client.release();
  }
}

export default pool;
