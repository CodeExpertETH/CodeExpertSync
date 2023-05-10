use std::fs;
use std::fs::File;
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
pub fn create_project_dir(path: String) -> Result<(), String> {
    let binding = Path::new(&path);
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
                set_read_only(p2)?;
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
