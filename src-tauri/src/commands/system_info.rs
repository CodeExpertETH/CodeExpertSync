use sysinfo::{System, SystemExt};

// `Option<String>` translates to `string | null` in JS
#[tauri::command]
pub fn system_info() -> Option<String> {
    let sys = System::new();
    sys.long_os_version()
}
