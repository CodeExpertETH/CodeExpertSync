use ed25519_compact::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct PemKeypair {
    private_key: String,
    public_key: String,
}

#[tauri::command]
pub fn create_keys() -> Option<PemKeypair> {
    let kp = KeyPair::generate();

    let pem = PemKeypair {
        private_key: kp.sk.to_pem(),
        public_key: kp.pk.to_pem(),
    };

    Some(pem)
}
