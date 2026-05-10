use crate::types::{TransactionRecord, Transfer};
use petgraph::graphmap::DiGraphMap;
use petgraph::algo::{dijkstra, connected_components};
use std::collections::HashMap;

pub type TxGraph = DiGraphMap<String, u128>;

/// Build a directed graph where nodes are addresses and edges are total transferred amounts.
pub fn build_graph(txs: &[TransactionRecord]) -> TxGraph {
    let mut g = TxGraph::new();
    for tx in txs {
        for t in &tx.transfers {
            g.add_node(t.from.clone());
            g.add_node(t.to.clone());
            // accumulate weight
            let cur = g.edge_weight(t.from.clone(), t.to.clone()).cloned().unwrap_or(0);
            g.add_edge(t.from.clone(), t.to.clone(), cur + t.amount);
        }
    }
    g
}

/// Compute simple centrality: out-degree + in-degree weighted by amounts
pub fn centrality_scores(g: &TxGraph) -> HashMap<String, f64> {
    let mut map = HashMap::new();
    for n in g.nodes() {
        let out: u128 = g.edges(n.clone()).map(|(_, _ , w)| *w).sum();
        let in_amt: u128 = g.edges_directed(n.clone(), petgraph::Direction::Incoming).map(|(_, _, w)| *w).sum();
        let s = (out + in_amt) as f64;
        map.insert(n.clone(), s);
    }
    map
}

/// Shortest path by amount cost (Dijkstra treating weight as inverse priority)
pub fn weighted_shortest_path(g: &TxGraph, start: &str, goal: &str) -> Option<(u128, Vec<String>)> {
    if !g.contains_node(start.to_string()) || !g.contains_node(goal.to_string()) { return None; }
    // Use dijkstra with cost as 1/amount (favor larger transfers) — to avoid floats use reciprocal mapping
    // Here we simply compute min-cost path where cost = 1/(amount+1) scaled; but we approximate by using amount as negative weight via custom mapping
    // For simplicity use unweighted shortest path via BFS limited to few hops (approx)
    let res = dijkstra(g, start.to_string(), Some(goal.to_string()), |_| 1u128);
    if let Some(cost) = res.get(goal) {
        // Reconstruct path is non-trivial here; return cost and empty path for now
        return Some((*cost, vec![]));
    }
    None
}
