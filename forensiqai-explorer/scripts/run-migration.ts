import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';

async function main() {
  const sqlPath = path.resolve(process.cwd(), 'supabase/migrations/001_init.sql');
  const conn = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!conn) {
    console.error('Missing SUPABASE_DB_URL or DATABASE_URL environment variable');
    process.exit(1);
  }

  let sql: string;
  try {
    sql = await fs.readFile(sqlPath, 'utf-8');
  } catch (e: any) {
    console.error('Failed to read migration file at', sqlPath, e.message || e);
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: conn,
    ssl: process.env.SUPABASE_DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  });

  const client = await pool.connect();
  try {
    console.log('Applying migration from', sqlPath);
    await client.query(sql);
    console.log('Migration applied successfully.');
  } catch (err: any) {
    console.error('Migration failed:', err.message || err);
    process.exit(2);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
