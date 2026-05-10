use anyhow::Result;
use reqwest::Client;
use serde_json::Value;
use std::env;

pub struct HeliusClient {
    client: Client,
    base: String,
    api_key: Option<String>,
}

impl HeliusClient {
    pub fn new() -> Self {
        let client = Client::builder().build().expect("reqwest client");
        let api_key = env::var("HELIUS_API_KEY").ok();
        let base = env::var("HELIUS_API_URL").unwrap_or_else(|_| "https://api.helius.xyz/v0".to_string());
        Self { client, base, api_key }
    }

    pub async fn fetch_transactions(&self, address: &str, limit: usize) -> Result<Vec<Value>> {
        let key = match &self.api_key {
            Some(k) => k.clone(),
            None => return Err(anyhow::anyhow!("HELIUS_API_KEY not set")),
        };
        let url = format!("{}/addresses/{}/transactions?api-key={}&limit={}", self.base, address, key, limit);
        let res = self.client.get(&url).send().await?;
        if !res.status().is_success() {
            let txt = res.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Helius error: {} - {}", res.status(), txt));
        }
        let v: Vec<Value> = res.json().await?;
        Ok(v)
    }
}

/// Generic JSON-RPC client (simple POST helper)
pub struct JsonRpcClient {
    client: Client,
    url: String,
}

impl JsonRpcClient {
    pub fn new(url: impl Into<String>) -> Self {
        Self { client: Client::new(), url: url.into() }
    }

    pub async fn post(&self, method: &str, params: serde_json::Value) -> Result<Value> {
        let payload = serde_json::json!({"jsonrpc":"2.0","id":1,"method":method,"params":params});
        let res = self.client.post(&self.url).json(&payload).send().await?;
        let val: Value = res.json().await?;
        Ok(val)
    }
}
