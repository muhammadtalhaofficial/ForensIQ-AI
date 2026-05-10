use crate::types::{TransactionRecord, Transfer};
use anyhow::Result;
use rayon::prelude::*;
use serde_json::Value;

/// Parse raw transaction JSON (Helius-style or generic) into TransactionRecord entries.
pub fn parse_transactions(raw: Vec<Value>, subject: &str) -> Result<Vec<TransactionRecord>> {
    // Use parallel iterator to speed up parsing large pages
    let records: Vec<TransactionRecord> = raw
        .into_par_iter()
        .filter_map(|tx| {
            // best-effort parsing
            let signature = tx.get("signature").and_then(|v| v.as_str()).map(|s| s.to_string()).or_else(|| tx.get("txHash").and_then(|v| v.as_str()).map(|s| s.to_string()));
            let signature = match signature {
                Some(s) => s,
                None => return None,
            };

            let slot = tx.get("slot").and_then(|v| v.as_u64());
            let block_time = tx.get("blockTime").and_then(|v| v.as_i64()).or_else(|| tx.get("block_time").and_then(|v| v.as_i64()));

            // Try to extract transfers from meta/pre/post balances if available
            let mut transfers: Vec<Transfer> = vec![];

            if let Some(meta) = tx.get("meta") {
                if let (Some(pre), Some(post)) = (meta.get("preBalances"), meta.get("postBalances")) {
                    let pre_arr = pre.as_array().cloned().unwrap_or_default();
                    let post_arr = post.as_array().cloned().unwrap_or_default();
                    if let Some(message) = tx.get("transaction" ).and_then(|t| t.get("message")) {
                        if let Some(account_keys) = message.get("accountKeys").and_then(|k| k.as_array()) {
                            let keys: Vec<String> = account_keys.iter().filter_map(|k| k.as_str().map(|s| s.to_string())).collect();
                            if pre_arr.len() == post_arr.len() && pre_arr.len() == keys.len() {
                                // compute deltas
                                for i in 0..keys.len() {
                                    let pre_v = pre_arr[i].as_u64().unwrap_or(0) as i128;
                                    let post_v = post_arr[i].as_u64().unwrap_or(0) as i128;
                                    let delta = post_v - pre_v;
                                    if delta != 0 {
                                        // If subject is sender (delta negative), find recipient heuristically
                                        let actor = keys[i].clone();
                                        if delta < 0 {
                                            // find best recipient: largest positive delta
                                            let mut best_idx: Option<usize> = None;
                                            let mut best_val: i128 = 0;
                                            for j in 0..keys.len() {
                                                if j == i { continue; }
                                                let p = post_arr[j].as_u64().unwrap_or(0) as i128 - pre_arr[j].as_u64().unwrap_or(0) as i128;
                                                if p > best_val { best_val = p; best_idx = Some(j); }
                                            }
                                            let to = best_idx.map(|bi| keys[bi].clone()).unwrap_or_else(|| "unknown".to_string());
                                            let t = Transfer {
                                                from: actor.clone(),
                                                to,
                                                amount: (-delta) as u128,
                                                token: None,
                                                signature: Some(signature.clone()),
                                                block_time,
                                            };
                                            transfers.push(t);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Fallback: try to parse common parsedTransfers if Helius provided
            if transfers.is_empty() {
                if let Some(pts) = tx.get("parsedTransfers").and_then(|v| v.as_array()) {
                    for p in pts {
                        if let (Some(from), Some(to), Some(amount)) = (p.get("from"), p.get("to"), p.get("amount")) {
                            transfers.push(Transfer {
                                from: from.as_str().unwrap_or_default().to_string(),
                                to: to.as_str().unwrap_or_default().to_string(),
                                amount: amount.as_u64().unwrap_or(0) as u128,
                                token: p.get("mint").and_then(|m| m.as_str()).map(|s| s.to_string()),
                                signature: Some(signature.clone()),
                                block_time,
                            });
                        }
                    }
                }
            }

            Some(TransactionRecord { signature, slot, block_time, transfers, raw: Some(tx) })
        })
        .collect();

    Ok(records)
}
