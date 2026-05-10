/**
 * Token estimation utilities. Prefer tiktoken if available, otherwise fall back to heuristic.
 */
export async function estimateTokens(text: string): Promise<number> {
  // try to use tiktoken if installed
  try {
    // dynamic import so the package is optional
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { encoding_for_model } = await import('@dqbd/tiktoken');
    const enc = encoding_for_model('gpt-4');
    const tokens = enc.encode(text).length;
    enc.free();
    return tokens;
  } catch (e) {
    // fallback heuristic: average 4 chars per token
    return Math.max(1, Math.ceil(text.length / 4));
  }
}
