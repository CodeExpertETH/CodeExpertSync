use std::fs;

use jsonwebtoken::{encode, Algorithm, EncodingKey};
use serde_json::Value;

use crate::utils::prelude::{Either, Traversable};

#[tauri::command]
pub fn create_jwt_token(
    app_handle: tauri::AppHandle,
    claims: Value,
) -> Result<Either<String, String>, String> {
    app_handle
        .path_resolver()
        .app_local_data_dir()
        .ok_or("Unable to determine app-local data dir".to_string())
        .map(|mut key_path| {
            key_path.push("privateKey.pem");
            key_path
        })
        .map(|key_path| {
            fs::read(key_path).map_err(|_| "Could not read private key file".to_string())
        })
        .and_then(|private_key| {
            private_key.traverse(|pk| {
                EncodingKey::from_ed_pem(&pk)
                    .map_err(|_| "Invalid key file".to_string())
                    .and_then(|encoding_key| {
                        encode(
                            &jsonwebtoken::Header::new(Algorithm::EdDSA),
                            &claims,
                            &encoding_key,
                        )
                        .map_err(|_| "Unable to encode JWT token".to_string())
                    })
                    .map_err(|e| format!("Could not create JWT token: {e}"))
            })
        })
        .map(Either::from)
}
