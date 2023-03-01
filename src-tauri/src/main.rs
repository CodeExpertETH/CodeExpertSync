use tauri::Manager;
use tauri_plugin_positioner::{Position, WindowExt};

mod system_tray;
mod utils;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg(test)]
mod tests {
    use crate::greet;

    #[test]
    fn greet_returns() {
        assert_eq!(greet("blub"), "Hello, blub! You've been greeted from Rust!");
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
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
            tauri::RunEvent::WindowEvent {
                event: tauri::WindowEvent::CloseRequested { api, .. },
                ..
            } => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.hide();
                }
                api.prevent_close();
            }
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
