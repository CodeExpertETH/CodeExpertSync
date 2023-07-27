use std::fs;
use std::fs::File;
use std::io::Write;

#[tauri::command]
pub fn create_project_path(path: String) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|e| format!("Could not create dir: {e}"))
}

#[tauri::command]
pub fn create_project_dir(path: String) -> Result<(), String> {
    fs::create_dir_all(path).map_err(|e| format!("Could not create dir: {e}"))
}

#[tauri::command]
pub fn write_project_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    File::create(path)
        .map_err(|e| format!("Could not create file: {e}"))
        .and_then(|mut f| {
            f.write_all(&contents)
                .map_err(|e| format!("Could not write to file: {e}"))
        })
}
