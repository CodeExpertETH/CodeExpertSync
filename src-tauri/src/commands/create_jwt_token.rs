use jsonwebtoken::{encode, Algorithm, EncodingKey};
use serde_json::Value;
use std::fs;

#[tauri::command]
pub fn create_jwt_token(app_handle: tauri::AppHandle, claims: Value) -> Result<String, String> {
    app_handle
        .path_resolver()
        .app_local_data_dir()
        .ok_or("Unable to determine app-local data dir".to_string())
        .map(|mut key_path| {
            key_path.push("privateKey.pem");
            key_path
        })
        .and_then(|key_path| {
            fs::read(key_path).map_err(|_| "Could not read private key file".to_string())
        })
        .and_then(|private_key| {
            EncodingKey::from_ed_pem(&private_key).map_err(|_| "Invalid key file".to_string())
        })
        .and_then(|encoding_key| {
            encode(
                &jsonwebtoken::Header::new(Algorithm::EdDSA),
                &claims,
                &encoding_key,
            )
            .map_err(|_| "Unable to encode JWT token".to_string())
        })
        .map_err(|e| {
            format!("Could not create JWT token: {e}")
        })
}
