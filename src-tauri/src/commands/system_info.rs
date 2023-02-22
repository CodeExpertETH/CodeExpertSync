use sysinfo::{System, SystemExt};

#[tauri::command]
pub fn system_info() -> Option<String> {
    let sys = System::new();
    sys.long_os_version()
}
