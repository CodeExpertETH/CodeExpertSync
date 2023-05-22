use brotli::CompressorWriter;
use std::fs::File;
use std::path::Path;
use tar::Builder;

#[tauri::command]
pub fn build_tar(file_name: String, root_dir: String, files: Vec<String>) -> Result<(), String> {
    let file = File::create(file_name).map_err(|e| {
        eprintln!("{e}");
        "Could not create archive file".to_string()
    })?;

    let compress = CompressorWriter::new(file, 4096, 11, 20);

    let mut tar = Builder::new(compress);
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
    })
}
