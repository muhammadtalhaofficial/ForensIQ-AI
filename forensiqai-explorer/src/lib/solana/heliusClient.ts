const IS_DEVNET = process.env.SOLANA_NETWORK === 'devnet';
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || process.env.HELIUS_KEY;
const HELIUS_BASE = process.env.HELIUS_API_URL || (IS_DEVNET ? 'https://api-devnet.helius.xyz/v0' : 'https://api.helius.xyz/v0');

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url: string, opts: any = {}, maxRetries = 4) {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, opts as any);
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`Transient status ${res.status}`);
      }
      return res;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) throw err;
      const backoff = 200 * Math.pow(2, attempt);
      await sleep(backoff + Math.random() * 100);
    }
  }
}

export interface HeliusFetchOptions {
  limit?: number;
  before?: string | null;
}

/**
 * Fetch transactions for a given address from Helius with pagination and retries.
 */
export async function fetchTransactions(address: string, opts: HeliusFetchOptions = {}) {
  if (!HELIUS_API_KEY) {
    throw new Error('Missing HELIUS_API_KEY in environment');
  }
  const limit = opts.limit ?? 100;
  const before = opts.before ? `&before=${encodeURIComponent(opts.before)}` : '';
  const url = `${HELIUS_BASE}/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}${before}`;
  const res = await fetchWithRetry(url, { method: 'GET' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Helius API error: ${res.status} ${text}`);
  }
  const payload = await res.json();
  return payload as any[];
}

/**
 * Fetch all transactions up to maxRecords (safe default) using pagination.
 */
export async function fetchAllTransactions(address: string, maxRecords = 1000) {
  const limit = 100;
  let all: any[] = [];
  let before: string | null = null;
  while (all.length < maxRecords) {
    const page = await fetchTransactions(address, { limit, before });
    if (!page || !page.length) break;
    all = all.concat(page);
    if (page.length < limit) break;
    // Helius returns in descending order; pick last signature as before cursor if available
    const last = page[page.length - 1];
    before = last.signature || last.txId || null;
    if (!before) break;
  }
  return all.slice(0, maxRecords);
}

export async function fetchWalletBalance(address: string) {
  if (!HELIUS_API_KEY) {
    throw new Error('Missing HELIUS_API_KEY in environment');
  }
  const url = IS_DEVNET 
    ? `https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
    : `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.result?.value || 0) / 1e9;
  } catch(e) {
    return 0;
  }
}
