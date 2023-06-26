use std::fs;
use std::fs::{File, Permissions};
use std::io::Write;
use std::path::Path;

#[tauri::command]
pub fn make_readonly(path: String) -> Result<(), String> {
    let binding = Path::new(&path);
    set_read_only(binding)
}

fn set_read_only(path: &Path) -> Result<(), String> {
    File::open(path)
        .and_then(|f| {
            f.metadata().map(|m| m.permissions()).map(|mut p| {
                p.set_readonly(true);
                f.set_permissions(p)
            })
        })
        .map(|_| ())
        .map_err(|e| format!("Could not set permissions of file: {e}"))
}

fn set_permissions(path: &Path, perms: Permissions) -> Result<(), String> {
    File::open(path)
        .and_then(|f| f.set_permissions(perms))
        .map(|_| ())
        .map_err(|e| format!("Could not set permissions of file: {e}"))
}

fn remove_read_only(path: &Path) -> Result<Permissions, String> {
    File::open(path)
        .and_then(|f| {
            f.metadata().map(|m| m.permissions()).map(|mut p| {
                let prev_perms = p.clone();
                p.set_readonly(false);
                let _ = f.set_permissions(p);
                prev_perms
            })
        })
        .map_err(|e| format!("Could not set permissions of file: {e}"))
}

fn get_existing_path(path: &Path) -> Result<&Path, String> {
    let mut ancestors = path.ancestors();
    for p in &mut ancestors {
        if p.exists() && p.is_dir() {
            return Ok(p);
        }
    }
    Err(format!("Could not find existing path"))
}

fn set_path_read_only(root_path: &Path, path: &Path, existing_path: &Path) -> Result<(), String> {
    let mut ancestors = path.ancestors();
    for p2 in &mut ancestors {
        // stop if root is reached
        if p2 == root_path {
            return Ok(());
        }
        set_read_only(p2)?;
        // stop if path is reached
        if p2 == existing_path {
            return Ok(());
        }
    }
    Ok(())
}
#[tauri::command]
pub fn create_project_path(path: String, root: String) -> Result<(), String> {
    let create_path = Path::new(&path);
    let root_path = Path::new(&root);
    get_existing_path(create_path).and_then(|existing_path| {
        //remove readonly from path
        remove_read_only(existing_path)?;
        // create dir
        fs::create_dir_all(create_path).map_err(|e| format!("Could not create dir: {e}"))?;
        // set permissions back to readonly for whole path
        set_path_read_only(root_path, create_path, existing_path)
    })?;
    // remove readonly from full path to allow students to write to it
    remove_read_only(create_path)?;
    Ok(())
}

#[tauri::command]
pub fn create_project_dir(path: String, read_only: bool) -> Result<(), String> {
    let create_path = Path::new(&path);
    create_path
        .parent()
        .ok_or("Could not get parent path".to_string())
        .and_then(|parent| {
            let parent_permissions = remove_read_only(parent)?;

            fs::create_dir_all(create_path).map_err(|e| format!("Could not create dir: {e}"))?;
            if read_only {
                set_read_only(create_path)?;
            }
            set_permissions(parent, parent_permissions)
        })
}

#[tauri::command]
pub fn write_file(path: String, contents: Vec<u8>, read_only: bool) -> Result<(), String> {
    let create_path = Path::new(&path);
    create_path
        .parent()
        .ok_or("Could not get parent path".to_string())
        .and_then(|parent| {
            let parent_permissions = remove_read_only(parent)?;

            File::create(create_path)
                .map_err(|e| format!("Could not create file: {e}"))
                .and_then(|mut f| {
                    f.write_all(&contents)
                        .map_err(|e| format!("Could not write to file: {e}"))
                })
                .and_then(|_| {
                    if read_only {
                        set_read_only(create_path)
                    } else {
                        Ok(())
                    }
                })
                .and_then(|_| set_permissions(parent, parent_permissions))
        })
}
