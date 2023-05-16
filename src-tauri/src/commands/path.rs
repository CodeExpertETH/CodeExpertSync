use std::path::Path;

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
