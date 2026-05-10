use forensiq_engine::parser::parse_transactions;
use serde_json::json;

#tokio::test
async fn parse_example_tx() {
    // simple synthetic Helius-like transaction
    let tx = json!({
        "signature": "sig1",
        "slot": 12345,
        "blockTime": 1620000000,
        "meta": {
            "preBalances": [1000, 0],
            "postBalances": [0, 1000]
        },
        "transaction": { "message": { "accountKeys": ["A","B"] } }
    });
    let v = vec![tx];
    let recs = parse_transactions(v, "A").expect("parse");
    assert_eq!(recs.len(), 1);
    let t = &recs[0];
    assert_eq!(t.transfers.len(), 1);
    assert_eq!(t.transfers[0].from, "A");
    assert_eq!(t.transfers[0].to, "B");
}
