use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, Wry,
};
use tauri_plugin_positioner::{Position, WindowExt};

pub fn handle_system_tray_event(app: &AppHandle<Wry>, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "toggle" => {
                match app.get_window("main") {
                    Some(window) => match window.is_visible() {
                        Ok(is_visible) => {
                            if is_visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.move_window(Position::TopRight);
                            }
                        }
                        _ => {}
                    },
                    _ => {}
                }
                set_toggle_name(app);
            }
            _ => {}
        },
        _ => {}
    }
}

pub fn set_toggle_name(app: &AppHandle<Wry>) {
    let menu_item = app.tray_handle().get_item("toggle");
    match app.get_window("main") {
        Some(window) => match window.is_visible() {
            Ok(is_visible) => {
                if is_visible {
                    let _ = menu_item.set_title("Show");
                } else {
                    let _ = menu_item.set_title("Hide");
                }
            }
            _ => {}
        },
        _ => {}
    }
}

fn create_tray_menu() -> SystemTrayMenu {
    let hide = CustomMenuItem::new("toggle".to_string(), "Hide");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    SystemTrayMenu::new()
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit)
}

pub fn create_system_tray() -> SystemTray {
    SystemTray::new().with_menu(create_tray_menu())
}
