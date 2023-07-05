use crate::utils::tee_writer::TeeWriter;
use brotli::CompressorWriter;
use data_encoding::HEXLOWER;
use sha2::{Digest, Sha256};
use std::fs::File;
use std::path::Path;

#[tauri::command]
pub fn build_tar(
    file_name: String,
    root_dir: String,
    files: Vec<String>,
) -> Result<String, String> {
    let file = File::create(file_name).map_err(|e| {
        format!("Could not create archive file: {e}")
    })?;

    let brotli = CompressorWriter::new(file, 4096, 11, 20);
    let hasher = Sha256::new();
    let tee = TeeWriter::new(brotli, hasher);

    let mut archive = tar::Builder::new(tee);
    archive.follow_symlinks(true);

    let root_dir = Path::new(&root_dir);
    for x in files {
        let abs_path = root_dir.join(&x);
        eprintln!("adding file '{}' with name '{}'", abs_path.display(), &x);
        archive.append_path_with_name(&abs_path, &x).map_err(|e| {
            format!("Could not add file to archive: {e}")
        })?;
    }

    let tee = archive.into_inner().map_err(|e| {
        format!("Could not close archive: {e}")
    })?;
    let (_, hasher) = tee.into_inner();
    Ok(HEXLOWER.encode(hasher.finalize().as_ref()))
}
