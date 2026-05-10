use crate::types::{Counterparty, ForensicReport, ForensicSignals, TransactionRecord};
use crate::graph::TxGraph;
use std::collections::HashMap;

/// Compute simple heuristics signals based on transactions and graph structure.
pub fn compute_signals(txs: &[TransactionRecord], graph: &TxGraph, subject: &str) -> ForensicSignals {
    let mut total_in: u128 = 0;
    let mut total_out: u128 = 0;
    let mut largest_out: u128 = 0;
    let mut outgoing24h: u128 = 0;
    let now = chrono::Utc::now().timestamp();
    let day_ago = now - 24 * 3600;

    for tx in txs {
        for t in &tx.transfers {
            if t.from == subject {
                total_out += t.amount;
                largest_out = largest_out.max(t.amount);
                if let Some(bt) = t.block_time {
                    if bt >= day_ago { outgoing24h += t.amount; }
                }
            }
            if t.to == subject { total_in += t.amount; }
        }
    }

    let rapid_draining = total_out > 0 && outgoing24h as f64 / total_out as f64 > 0.6 && outgoing24h > 1_000_000_000u128;
    let mixer_interaction = detect_mixer_interaction(graph, subject);
    let wash_trading = detect_wash_trading(txs, subject);

    ForensicSignals {
        rapid_draining,
        mixer_interaction,
        bridge_hopping: false,
        wash_trading,
        dormant_activation: false,
        flash_attack: false,
    }
}

fn detect_mixer_interaction(graph: &TxGraph, subject: &str) -> bool {
    // placeholder: check neighbors against known mixers or high-degree nodes
    if !graph.contains_node(subject.to_string()) { return false; }
    let mut cnt = 0;
    for (nbr, _) in graph.neighbors(subject.to_string()) {
        let deg = graph.edges(nbr.clone()).count();
        if deg > 50 { cnt += 1; }
        if cnt > 2 { return true; }
    }
    false
}

fn detect_wash_trading(txs: &[TransactionRecord], subject: &str) -> bool {
    // detect repeated small transfers between subject and same counterparty
    let mut pair_counts: HashMap<String, usize> = HashMap::new();
    for tx in txs {
        for t in &tx.transfers {
            if t.from == subject {
                *pair_counts.entry(t.to.clone()).or_default() += 1;
            } else if t.to == subject {
                *pair_counts.entry(t.from.clone()).or_default() += 1;
            }
        }
    }
    pair_counts.values().any(|&c| c > 5)
}

/// Build a simple Counterparty summary
pub fn summarize_counterparties(txs: &[TransactionRecord], subject: &str) -> Vec<Counterparty> {
    let mut map: HashMap<String, (usize, u128)> = HashMap::new();
    for tx in txs {
        for t in &tx.transfers {
            if t.from == subject {
                let entry = map.entry(t.to.clone()).or_insert((0, 0));
                entry.0 += 1;
                entry.1 += t.amount;
            } else if t.to == subject {
                let entry = map.entry(t.from.clone()).or_insert((0, 0));
                entry.0 += 1;
                entry.1 += t.amount;
            }
        }
    }
    let total_out: u128 = map.values().map(|(_, amt)| *amt).sum();
    map.into_iter().map(|(addr, (transfers, total_amount))| {
        let proportion = if total_out > 0 { total_amount as f64 / total_out as f64 } else { 0.0 };
        Counterparty { address: addr, transfers, total_amount, score: proportion, reasons: vec![] }
    }).collect()
}

/// Simple risk scoring combining signals
pub fn compute_risk_score(signals: &ForensicSignals, largest_outgoing: u128, total_outgoing: u128) -> f64 {
    let mut score = 0.0;
    if signals.rapid_draining { score += 0.5; }
    if signals.mixer_interaction { score += 0.25; }
    if signals.wash_trading { score += 0.1; }
    score += (largest_outgoing as f64 / (total_outgoing.max(1) as f64)) * 0.15;
    score.min(1.0)
}
