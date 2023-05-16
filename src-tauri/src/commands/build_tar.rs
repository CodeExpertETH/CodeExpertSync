use brotli;
use std::fs::File;
use std::path::{Path, PathBuf};
use tar::Builder;

#[tauri::command]
pub fn build_tar(root_dir: String, files: Vec<String>) -> Result<String, String> {
    let tar_br = "archive.tar.br";
    let tar_br = File::create(tar_br).map_err(|e| {
        eprintln!("{e}");
        "Could not create archive file".to_string()
    })?;

    let mut tar = Builder::new(tar_br);
    tar.follow_symlinks(false);

    let root_dir = Path::new(&root_dir);
    for x in files {
        let abs_path = root_dir.join(&x).canonicalize().map_err(|e| {
            eprintln!("{}", e);
            "Could not build a valid path".to_string()
        })?;
        eprintln!("adding file '{}' with name '{}'", abs_path.display(), &x);
        tar.append_path_with_name(&abs_path, &x).map_err(|e| {
            eprintln!("{}", e);
            "Could not add file to archive".to_string()
        })?;
    }
    tar.finish().map_err(|e| {
        eprintln!("{e}");
        "Could not close archive".to_string()
    })?;

    Ok("archive.tar".to_string())
}
