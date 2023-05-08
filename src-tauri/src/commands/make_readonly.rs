use std::fs::File;
use std::path::Path;

#[tauri::command]
pub fn make_readonly(path: String) -> Result<(), String> {
    let f = File::open(path).map_err(|e| format!("Could not open file: {e}"))?;

    let metadata = f
        .metadata()
        .map_err(|e| format!("Could not read metadata of file: {e}"))?;
    let mut permissions = metadata.permissions();
    permissions.set_readonly(true);
    f.set_permissions(permissions)
        .map_err(|e| format!("Could not set permissions of file: {e}"))?;

    Ok(())
}

#[tauri::command]
pub fn create_dir_force(path: String) -> Result<(), String> {
    let mut ancestors = Path::new(&String::from(path)).ancestors();
    // loop over ancestors until path exists or root is reached
    while let Some(p) = ancestors.next() {
        if p.exists() && p.is_dir() {
            let metadata = p
                .metadata()
                .map_err(|e| format!("Could not read metadata of file: {e}"))?;
            let mut permissions = metadata.permissions();
            if permissions.readonly() {
                // make writeable
                permissions.set_readonly(false);
                let f = File::open(p).map_err(|e| format!("Could not open file: {e}"))?;
                f.set_permissions(permissions)
                    .map_err(|e| format!("Could not set permissions of file: {e}"))?;
            }
            break;
        }
    }
    // set permissions back to readonly for whole path

    Ok(())
}
