use tauri::Manager;
use tauri_plugin_positioner::{Position, WindowExt};

mod commands;
mod system_tray;
mod utils;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {name}! You've been greeted from Rust!")
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
        .plugin(tauri_plugin_persisted_scope::init())
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
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::system_info::system_info,
            commands::create_keys::create_keys,
            commands::create_jwt_token::create_jwt_token,
            commands::get_file_hash::get_file_hash,
            commands::fs_extra::make_readonly,
            commands::fs_extra::create_project_dir,
            commands::path::path_remove_ancestor
        ])
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
