use std::path::{Path, PathBuf};

#[tauri::command]
pub fn path_remove_ancestor(ancestor: String, to: String) -> Result<String, String> {
    let ancestor = Path::new(&ancestor);
    let to = Path::new(&to);
    let relative = to.strip_prefix(ancestor).map_err(|e| {
        eprintln!("{}", e);
        "Could not strip ancestor directory".to_string()
    })?;
    Path::new(".")
        .join(relative)
        .into_os_string()
        .into_string()
        .map_err(|_| "Could not convert result to String".to_string())
}

#[tauri::command]
pub fn path_parse_relative_path(path: String) -> Result<Vec<String>, String> {
    Path::new(&path)
        .into_iter()
        .map(|c| c.to_os_string())
        .map(|c| {
            c.into_string()
                .map_err(|_| "Could not convert result to String".to_string())
        })
        .collect()
}

#[tauri::command]
pub fn path_to_native_path(path: Vec<String>) -> Result<String, String> {
    path.iter()
        .collect::<PathBuf>()
        .into_os_string()
        .into_string()
        .map_err(|_| "Could not convert result to String".to_string())
}
