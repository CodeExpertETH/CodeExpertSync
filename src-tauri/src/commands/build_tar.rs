use brotli::CompressorWriter;
use std::fs::File;
use std::path::Path;

#[tauri::command]
pub fn build_tar(file_name: String, root_dir: String, files: Vec<String>) -> Result<(), String> {
    let file = File::create(file_name).map_err(|e| {
        eprintln!("{e}");
        "Could not create archive file".to_string()
    })?;

    let brotli = CompressorWriter::new(file, 4096, 11, 20);

    let mut archive = tar::Builder::new(brotli);
    archive.follow_symlinks(true);

    let root_dir = Path::new(&root_dir);
    for x in files {
        let abs_path = root_dir.join(&x).canonicalize().map_err(|e| {
            eprintln!("{}", e);
            "Could not build a valid path".to_string()
        })?;
        eprintln!("adding file '{}' with name '{}'", abs_path.display(), &x);
        archive.append_path_with_name(&abs_path, &x).map_err(|e| {
            eprintln!("{}", e);
            "Could not add file to archive".to_string()
        })?;
    }
    archive.finish().map_err(|e| {
        eprintln!("{e}");
        "Could not close archive".to_string()
    })
}
