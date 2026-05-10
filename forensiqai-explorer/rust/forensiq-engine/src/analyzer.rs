use crate::graph;
use crate::heuristics;
use crate::parser;
use crate::rpc::HeliusClient;
use crate::types::{ForensicReport, ForensicSignals};
use crate::utils;
use anyhow::Result;
use rayon::prelude::*;
use std::collections::HashMap;

pub async fn analyze_wallet(wallet: &str, max_records: usize) -> Result<ForensicReport> {
    // fetch
    let client = HeliusClient::new();
    let raw = client.fetch_transactions(wallet, max_records).await?;

    // parse (parallel inside parser)
    let txs = parser::parse_transactions(raw, wallet)?;

    // build graph
    let g = graph::build_graph(&txs);

    // heuristics
    let signals: ForensicSignals = heuristics::compute_signals(&txs, &g, wallet);
    let counterparties = heuristics::summarize_counterparties(&txs, wallet);

    let total_out: u128 = counterparties.iter().map(|c| c.total_amount).sum();
    let largest_out = counterparties.iter().map(|c| c.total_amount).max().unwrap_or(0);
    let risk_score = heuristics::compute_risk_score(&signals, largest_out, total_out);

    let evidence = HashMap::new();

    let mut report = ForensicReport {
        wallet: wallet.to_string(),
        analyzed_at: chrono::Utc::now().to_rfc3339(),
        tx_count: txs.len(),
        total_incoming: 0,
        total_outgoing: total_out,
        largest_outgoing: largest_out,
        counterparties,
        signals,
        risk_score,
        confidence: 0.7,
        evidence,
        report_hash: None,
    };

    // compute totals
    for tx in &txs {
        for t in &tx.transfers {
            if t.to == wallet { report.total_incoming += t.amount; }
        }
    }

    // hash
    let hash_input = serde_json::to_string(&report)?;
    report.report_hash = Some(utils::sha256_hex(&hash_input));

    Ok(report)
}
