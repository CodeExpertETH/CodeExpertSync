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
            "open" => match app.get_window("main") {
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
            },
            _ => {}
        },
        _ => {}
    }
}

fn create_tray_menu() -> SystemTrayMenu {
    let hide = CustomMenuItem::new("open".to_string(), "Open");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    SystemTrayMenu::new()
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit)
}

pub fn create_system_tray() -> SystemTray {
    SystemTray::new().with_menu(create_tray_menu())
}
