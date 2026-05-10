use crate::types::TransactionRecord;
use crate::graph::TxGraph;
use anyhow::Result;

/// Plugin trait for custom heuristics. Plugins must be registered at runtime.
pub trait HeuristicPlugin: Send + Sync {
    fn name(&self) -> &str;
    fn analyze(&self, graph: &TxGraph, txs: &[TransactionRecord]) -> Result<Vec<String>>;
}

/// Simple registry to hold plugins in-process.
pub struct PluginRegistry {
    plugins: Vec<Box<dyn HeuristicPlugin>>,
}

impl PluginRegistry {
    pub fn new() -> Self { Self { plugins: vec![] } }
    pub fn register(&mut self, p: Box<dyn HeuristicPlugin>) { self.plugins.push(p); }
    pub fn analyze_all(&self, graph: &TxGraph, txs: &[TransactionRecord]) -> Result<Vec<String>> {
        let mut results = vec![];
        for p in &self.plugins {
            let r = p.analyze(graph, txs)?;
            results.extend(r);
        }
        Ok(results)
    }
}
