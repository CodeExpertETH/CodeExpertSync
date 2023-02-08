use tauri::Manager;
use tauri_plugin_positioner;
use tauri_plugin_positioner::{Position, WindowExt};

mod system_tray;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .setup(|app| {
            if let Some(window) = app.get_window("main") {
                let _ = window.move_window(Position::TopRight);
            }
            Ok(())
        })
        .system_tray(system_tray::create_system_tray())
        .on_system_tray_event(system_tray::handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![greet])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app, event| match event {
            tauri::RunEvent::WindowEvent { event, .. } => match event {
                tauri::WindowEvent::CloseRequested { api, .. } => {
                    if let Some(window) = app.get_window("main") {
                        let _ = window.hide();
                    }
                    api.prevent_close();
                }
                _ => {}
            },
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
