use jsonwebtoken::{encode, Algorithm, EncodingKey};
use serde::Serialize;
use serde_json::Value;
use std::fs;

trait Traversable<T> {
    type Output<U>;

    fn traverse<U, G, F: FnOnce(T) -> Result<U, G>>(self, op: F) -> Result<Self::Output<U>, G>;
}

impl<T, E> Traversable<T> for Result<T, E> {
    type Output<U> = Result<U, E>;

    fn traverse<U, G, F: FnOnce(T) -> Result<U, G>>(self, op: F) -> Result<Result<U, E>, G> {
        match self {
            Err(e) => Ok(Err(e)),
            Ok(t) => op(t).map(|u| Ok(u)),
        }
    }
}

#[derive(Serialize, Debug)]
#[serde(tag = "_tag", content = "value")]
pub enum Either<E, A> {
    Left(E),
    Right(A),
}

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
        .map(|e| match e {
            Ok(t) => Either::Right(t),
            Err(e) => Either::Left(e),
        })
}
