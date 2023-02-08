use tauri::{Manager, Wry};
use tauri_plugin_positioner;
use tauri_plugin_positioner::{Position, WindowExt};

mod system_tray;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_window(app_handle: tauri::AppHandle<Wry>) {
    println!("open Window called");
    system_tray::window_helpers::open_app_window(&app_handle);
}

fn main() {
    // prepare() checks if it's a single instance and tries to send the args otherwise.
    // It should always be the first line in your main function (with the exception of loggers or similar)
    tauri_plugin_deep_link::prepare("code-expert-desktop");
    // It's expected to use the identifier from tauri.conf.json
    // Unfortuenetly getting it is pretty ugly without access to sth that implements `Manager`.

    tauri::Builder::default()
        .plugin(tauri_plugin_positioner::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
        }))
        .setup(|app| {
            // This could be called right after prepare() but then you don't have access to tauri APIs
            let handle = app.handle();
            tauri_plugin_deep_link::register(
                "code-expert-desktop",
                move |request| {
                    dbg!(&request);
                    let _ = handle.emit_all("scheme-request-received", request);
                },
            )
                .unwrap(/* If listening to the scheme is optional for your app, you don't want to unwrap here. */);
            if let Some(window) = app.get_window("main") {
                let _ = window.move_window(Position::TopRight);
            }
            Ok(())
        })

        .system_tray(system_tray::create_system_tray())
        .on_system_tray_event(system_tray::handle_system_tray_event)
        .invoke_handler(tauri::generate_handler![greet, open_window])
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
