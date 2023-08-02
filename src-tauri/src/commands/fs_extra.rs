use std::fs;
use std::fs::File;
use std::io::Write;
use std::path::Path;

fn ensure_parent_exists(path: &Path) -> Result<(), String> {
    match path.parent() {
        Some(parent) => {
            fs::create_dir_all(parent).map_err(|e| format!("Could not create dir: {e}"))
        }
        _ => Ok(()),
    }
}

#[tauri::command]
pub fn write_project_file(project: String, file: String, content: Vec<u8>) -> Result<(), String> {
    let full_path = Path::new(&project).join(file);
    ensure_parent_exists(&full_path)
        .and_then(|()| File::create(full_path).map_err(|e| format!("Could not create file: {e}")))
        .and_then(|mut f| {
            f.write_all(&content)
                .map_err(|e| format!("Could not write to file: {e}"))
        })
}
