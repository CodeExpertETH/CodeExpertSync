use std::fs::File;
use std::io;

use data_encoding::HEXLOWER;
use sha2::{Digest, Sha256};

#[tauri::command]
pub fn get_file_hash(path: String) -> Result<String, String> {
    let mut hasher = Sha256::new();

    let mut input = File::open(path).map_err(|e| format!("Could not open file: {e}"))?;

    io::copy(&mut input, &mut hasher).map_err(|e| format!("Could not consume file: {e}"))?;
    let digest = hasher.finalize();

    Ok(HEXLOWER.encode(digest.as_ref()))
}
