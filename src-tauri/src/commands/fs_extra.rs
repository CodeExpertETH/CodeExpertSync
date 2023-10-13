use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;

use crate::utils::prelude::Either;

fn ensure_parent_exists(path: &Path) -> Result<(), String> {
    match path.parent() {
        Some(parent) => {
            fs::create_dir_all(parent).map_err(|e| format!("Could not create dir: {e}"))
        }
        _ => Ok(()),
    }
}

#[tauri::command]
pub fn write_file_ancestors(file: String, content: Vec<u8>) -> Either<String, ()> {
    let path = Path::new(&file);
    ensure_parent_exists(&path)
        .and_then(|()| File::create(path).map_err(|e| format!("Could not create file: {e}")))
        .and_then(|mut f| {
            f.write_all(&content)
                .map_err(|e| format!("Could not write to file: {e}"))
        })
        .into()
}
