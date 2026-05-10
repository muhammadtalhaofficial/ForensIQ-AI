use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Transfer {
    pub from: String,
    pub to: String,
    pub amount: u128,
    pub token: Option<String>,
    pub signature: Option<String>,
    pub block_time: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransactionRecord {
    pub signature: String,
    pub slot: Option<u64>,
    pub block_time: Option<i64>,
    pub transfers: Vec<Transfer>,
    pub raw: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Counterparty {
    pub address: String,
    pub transfers: usize,
    pub total_amount: u128,
    pub score: f64,
    pub reasons: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ForensicSignals {
    pub rapid_draining: bool,
    pub mixer_interaction: bool,
    pub bridge_hopping: bool,
    pub wash_trading: bool,
    pub dormant_activation: bool,
    pub flash_attack: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ForensicReport {
    pub wallet: String,
    pub analyzed_at: String,
    pub tx_count: usize,
    pub total_incoming: u128,
    pub total_outgoing: u128,
    pub largest_outgoing: u128,
    pub counterparties: Vec<Counterparty>,
    pub signals: ForensicSignals,
    pub risk_score: f64,
    pub confidence: f64,
    pub evidence: HashMap<String, String>,
    pub report_hash: Option<String>,
}
