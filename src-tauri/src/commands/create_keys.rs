use ed25519_compact::*;
use std::fs;

#[tauri::command]
pub fn create_keys(app_handle: tauri::AppHandle) -> Result<String, String> {
    let kp = KeyPair::generate();

    app_handle
        .path_resolver()
        .app_local_data_dir()
        .ok_or("Did not fund local dir".to_string())
        .map(|mut key_path| {
            key_path.push("privateKey.pem");
            key_path
        })
        .and_then(|key_path| {
            fs::write(key_path, kp.sk.to_pem())
                .map_err(|_| "Could not write private key".to_string())
        })
        .map(|_| kp.pk.to_pem())
}
