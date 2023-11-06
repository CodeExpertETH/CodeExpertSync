use ed25519_compact::*;
use std::fs;

#[tauri::command]
pub fn create_keys(app_handle: tauri::AppHandle) -> Result<String, String> {
    let kp = KeyPair::generate();

    app_handle
        .path_resolver()
        .app_local_data_dir()
        .ok_or("Did not find local dir".to_string())
        .map(|mut path| {
            fs::create_dir_all(&path)
                .map_err(|_| "Could not create app local data dir".to_string())
                .map(|_| {
                    path.push("privateKey.pem");
                    path
                })
                .and_then(|key_path| {
                    fs::write(key_path, kp.sk.to_pem())
                        .map_err(|_| "Could not write private key".to_string())
                })
        })
        .map(|_| kp.pk.to_pem())
}
