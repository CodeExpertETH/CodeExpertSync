use tauri::{api::process::restart, AppHandle, Manager, Wry};

#[tauri::command]
pub fn app_restart(app_handle: AppHandle<Wry>) -> () {
    restart(&app_handle.env())
}
