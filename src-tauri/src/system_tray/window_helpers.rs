use tauri::{AppHandle, Manager, Wry};
use tauri_plugin_positioner;
use tauri_plugin_positioner::Position;
use tauri_plugin_positioner::WindowExt;

pub fn open_app_window(app: &AppHandle<Wry>) {
    match app.get_window("main") {
        Some(window) => match window.is_visible() {
            Ok(is_visible) => {
                if is_visible {
                    let _ = window.set_focus();
                } else {
                    let _ = window.show();
                    let _ = window.move_window(Position::TopRight);
                }
            }
            _ => {}
        },
        _ => {}
    }
}
