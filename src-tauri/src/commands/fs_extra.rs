use std::fs;
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

fn set_read_only(path: &Path) -> Result<(), String> {
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

fn remove_read_only(path: &Path) -> Result<(), String> {
    let f = File::open(path).map_err(|e| format!("Could not open file: {e}"))?;
    let metadata = f
        .metadata()
        .map_err(|e| format!("Could not read metadata of file: {e}"))?;
    let mut permissions = metadata.permissions();
    permissions.set_readonly(false);
    f.set_permissions(permissions)
        .map_err(|e| format!("Could not set permissions of file: {e}"))?;
    Ok(())
}

#[tauri::command]
pub fn create_project_dir(path: String) -> Result<(), String> {
    let binding = Path::new(&path);
    let mut ancestors = binding.ancestors();
    let mut ancestors2 = binding.ancestors();
    // loop over ancestors until path exists or root is reached
    while let Some(p) = ancestors.next() {
        if p.exists() && p.is_dir() {
            //remove readonly from path
            remove_read_only(&p)?;
            // create dir
            fs::create_dir_all(&binding).map_err(|e| format!("Could not create dir: {e}"))?;
            // set permissions back to readonly for whole path
            while let Some(p2) = ancestors2.next() {
                set_read_only(p2)?;
                if p2 == p {
                    break;
                }
            }
            break;
        }
    }
    remove_read_only(binding)?;

    Ok(())
}
