use forensiq_engine::analyzer::analyze_wallet;
use std::env;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: forensiq-engine <WALLET_ADDRESS> [max_records]");
        std::process::exit(2);
    }
    let wallet = &args[1];
    let max_records = args.get(2).and_then(|s| s.parse::<usize>().ok()).unwrap_or(1000);

    match analyze_wallet(wallet, max_records).await {
        Ok(rep) => println!("{}", serde_json::to_string_pretty(&rep).unwrap()),
        Err(e) => {
            eprintln!("Analysis failed: {}", e);
            std::process::exit(1);
        }
    }
}
