use sha2::{Digest, Sha256};
use hex;

pub fn sha256_hex(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let res = hasher.finalize();
    hex::encode(res)
}
