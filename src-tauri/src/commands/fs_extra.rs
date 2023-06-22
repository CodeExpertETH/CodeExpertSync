use std::fs;
use std::fs::File;
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

fn remove_read_only(path: &Path) -> Result<(), String> {
    File::open(path)
        .and_then(|f| {
            f.metadata().map(|m| m.permissions()).map(|mut p| {
                p.set_readonly(false);
                f.set_permissions(p)
            })
        })
        .map(|_| ())
        .map_err(|e| format!("Could not set permissions of file: {e}"))
}

#[tauri::command]
pub fn create_project_dir(path: String, root: String) -> Result<(), String> {
    let binding = Path::new(&path);
    let root_path = Path::new(&root);
    let mut ancestors = binding.ancestors();
    let mut ancestors2 = binding.ancestors();
    // loop over ancestors until path exists or root is reached
    for p in &mut ancestors {
        if p.exists() && p.is_dir() {
            //remove readonly from path
            remove_read_only(p)?;
            // create dir
            fs::create_dir_all(binding).map_err(|e| format!("Could not create dir: {e}"))?;
            // set permissions back to readonly for whole path
            for p2 in &mut ancestors2 {
                // stop if root is reached
                if p2 == root_path {
                    break;
                }
                set_read_only(p2)?;
                // stop if path is reached
                if p2 == p {
                    break;
                }
            }
            break;
        }
    }
    // remove readonly from full path to allow students to write to it
    remove_read_only(binding)?;

    Ok(())
}

#[tauri::command]
pub fn write_file(path: String, contents: Vec<u8>, read_only: bool) -> Result<(), String> {
    let binding = Path::new(&path);

    File::create(&binding)
        .map_err(|e| format!("Could not create file: {e}"))
        .and_then(|mut f| {
            f.write_all(&contents)
                .map_err(|e| format!("Could not write to file: {e}"))
        })
        .and_then(|_| {
            if read_only {
                set_read_only(&binding)
            } else {
                Ok(())
            }
        })
}
