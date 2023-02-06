use tauri::{AppHandle, Manager, Wry};
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn handle_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    if let SystemTrayEvent::MenuItemClick { id, .. } = event {
        match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "toggle" => {
                println!("system menu item received a click");

                let window = app.get_window("main").unwrap();
                let menu_item = app.tray_handle().get_item("toggle");
                if window.is_visible().unwrap() {
                    window.hide().expect("TODO: panic message");
                    menu_item.set_title("Show").expect("TODO: panic message");
                } else {
                    window.show().expect("TODO: panic message");
                    window.center().expect("TODO: panic message");
                    menu_item.set_title("Hide").expect("TODO: panic message");
                }
            }
            _ => {}
        }
    }
}

fn create_tray_menu() -> SystemTrayMenu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("toggle".to_string(), "Hide");
    let tray_menu = SystemTrayMenu::new()
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    return tray_menu;
}

fn main() {
    tauri::Builder::default()
        .system_tray(SystemTray::new().with_menu(create_tray_menu()))
        .on_system_tray_event(handle_tray_event)
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
