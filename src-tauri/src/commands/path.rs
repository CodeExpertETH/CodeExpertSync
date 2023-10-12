use std::path::{Path, PathBuf};

use crate::utils::prelude::{Either, Traversable};

#[tauri::command]
pub fn path_remove_ancestor(
    ancestor: String,
    to: String,
) -> Result<Either<String, String>, String> {
    Path::new(&to)
        .strip_prefix(ancestor)
        .map_err(|e| {
            eprintln!("{}", e);
            "Could not strip ancestor directory".to_string()
        })
        .traverse(|r| {
            Path::new(".")
                .join(r)
                .into_os_string()
                .into_string()
                .map_err(|_| "Could not convert result to String".to_string())
        })
        .map(Result::into)
}

#[tauri::command]
pub fn path_parse_relative_path(path: String) -> Result<Vec<String>, String> {
    Path::new(&path)
        .into_iter()
        .map(|c| c.to_os_string())
        .map(|c| {
            c.into_string()
                .map_err(|_| "Could not convert result to String".to_string())
        })
        .collect()
}

#[tauri::command]
pub fn path_to_native_path(path: Vec<String>) -> Result<String, String> {
    path.iter()
        .collect::<PathBuf>()
        .into_os_string()
        .into_string()
        .map_err(|_| "Could not convert result to String".to_string())
}

#[cfg(test)]
mod tests {
    use crate::commands::path::{path_remove_ancestor, path_to_native_path};
    use crate::utils::prelude::Either::{Left, Right};

    fn get_invalid_utf8() -> String {
        unsafe { String::from_utf8_unchecked(vec![0xc3, 0x28]) }
    }

    #[test]
    fn strip_ancestor_invalid_utf8() {
        assert_eq!(
            path_remove_ancestor("".to_string(), get_invalid_utf8()),
            Err("Could not convert result to String".to_string())
        );
    }

    #[test]
    fn strip_ancestor_no_ancestor() {
        assert_eq!(
            path_remove_ancestor("/bar".to_string(), "/foo/test.txt".to_string()),
            Ok(Left("Could not strip ancestor directory".to_string()))
        );
    }

    #[test]
    fn strip_ancestor_ok() {
        assert_eq!(
            path_remove_ancestor("/foo".to_string(), "/foo/test.txt".to_string()),
            Ok(Right("./test.txt".to_string()))
        );
    }

    #[test]
    fn empty_list() {
        assert_eq!(path_to_native_path(vec![]), Ok("".to_string()));
    }

    #[test]
    fn colon() {
        assert_eq!(
            path_to_native_path(vec![":".to_string()]),
            Ok(":".to_string())
        );
    }

    #[test]
    fn empty_string() {
        assert_eq!(
            path_to_native_path(vec!["".to_string()]),
            Ok("".to_string())
        );
    }

    #[test]
    fn empty_string_and_legal_name() {
        assert_eq!(
            path_to_native_path(vec!["".to_string(), ".git".to_string()]),
            Ok(".git".to_string())
        );
    }

    #[test]
    fn space() {
        assert_eq!(
            path_to_native_path(vec![" ".to_string()]),
            Ok(" ".to_string())
        );
    }

    #[test]
    fn slash() {
        assert_eq!(
            path_to_native_path(vec!["/".to_string()]),
            Ok("/".to_string())
        );
    }

    #[test]
    fn double_absolute() {
        let elems: Vec<String> = ["/", "etc", "/", "var"]
            .iter()
            .map(|s| s.to_string())
            .collect();
        assert_eq!(path_to_native_path(elems), Ok("/var".to_string()));
    }

    #[test]
    fn ivalid_utf8() {
        assert_eq!(
            path_to_native_path(vec![get_invalid_utf8()]),
            Err("Could not convert result to String".to_string())
        );
    }
}
