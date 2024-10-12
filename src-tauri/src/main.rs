// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;
mod tunnel;

use arboard::{Clipboard, ImageData};
use base64::{engine::general_purpose::STANDARD, Engine};
use image::{load_from_memory_with_format, ImageFormat};
use once_cell::sync::Lazy;
use serde::Serialize;
use std::path::Path;
use std::process::Command;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tracing::{debug, error, info, Level};
use tracing_subscriber::FmtSubscriber;

use server::{get_available_port, run_server};
use tunnel::{kill_tunnel, start_tunnel};

// Global task storage using Lazy and Mutex
static SERVER_TASK: Lazy<Arc<Mutex<Option<JoinHandle<()>>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

async fn stop_server() -> Result<(), String> {
    let mut server_task_lock = SERVER_TASK.lock().await;
    if let Some(task) = server_task_lock.take() {
        task.abort(); // Abort the server task
        Ok(())
    } else {
        Err("No server task to abort.".to_string())
    }
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct SharedPayload {
    path: String,
    url: String,
    success: bool,
    is_directory: bool,
}

#[tauri::command]
fn open(path: String, os_type: String) {
    if os_type == "windows" {
        Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .unwrap();
    } else {
        Command::new("open").args(["-R", &path]).spawn().unwrap();
    }
}

#[tauri::command]
fn log(text: String) {
    debug!("[FE LOG]: {}", text);
}

#[tauri::command]
async fn stop() -> Result<bool, bool> {
    let tunnel_result = kill_tunnel().map_err(|_| error!("Error killing tunnel."));
    let server_result = stop_server().await;

    if tunnel_result.is_err() || server_result.is_err() {
        Ok(false)
    } else {
        Ok(true)
    }
}

#[tauri::command]
async fn serve(
    path: String,
    username: Option<String>,
    password: Option<String>,
) -> Result<SharedPayload, ()> {
    let _ = stop().await;

    let port = get_available_port().unwrap_or(8765);
    let success = Arc::new(Mutex::new(true));
    let path_clone = path.clone();

    let server_task = tokio::spawn({
        let success_clone = Arc::clone(&success);
        async move {
            if let Err(e) = run_server(path_clone, port, username, password).await {
                *success_clone.lock().await = false;
                error!("Error running server: {:?}", e);
            }
        }
    });

    *SERVER_TASK.lock().await = Some(server_task);

    let is_directory = Path::new(&path).is_dir();
    let mut url = String::from("");

    let tunnel_success = if *success.lock().await {
        match start_tunnel(port) {
            Ok(tunnel_url) => {
                info!("Started Bore tunnel successfully");
                url = tunnel_url;
                true
            }
            Err(error) => {
                error!("Error starting Bore tunnel: {}", error);
                false
            }
        }
    } else {
        *success.lock().await
    };
    info!("{}::{}", url, tunnel_success);
    Ok(SharedPayload {
        path,
        url,
        success: tunnel_success,
        is_directory,
    })
}

#[tauri::command]
fn copy_image_to_clipboard(base64_string: String) -> Result<(), String> {
    let base64_data = base64_string
        .split(',')
        .nth(1)
        .ok_or("Invalid base64 string")?;
    let image_data = STANDARD
        .decode(base64_data)
        .map_err(|err| err.to_string())?;

    let img = load_from_memory_with_format(&image_data, ImageFormat::Png)
        .map_err(|err| err.to_string())?;

    let rgba_image = img.to_rgba8();
    let (width, height) = rgba_image.dimensions();
    let raw_pixels = rgba_image.into_raw();

    let clipboard_image = ImageData {
        width: width as usize,
        height: height as usize,
        bytes: std::borrow::Cow::Owned(raw_pixels),
    };

    let mut clipboard = Clipboard::new().map_err(|err| err.to_string())?;
    clipboard
        .set_image(clipboard_image)
        .map_err(|err| err.to_string())?;

    Ok(())
}

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set global default subscriber");

    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_nosleep::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_aptabase::Builder::new("A-EU-5257789286").build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            log,
            stop,
            serve,
            open,
            copy_image_to_clipboard
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
