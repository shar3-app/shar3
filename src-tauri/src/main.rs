// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;
mod tunnel;

use serde::Serialize;
use std::net::{IpAddr, Ipv4Addr};
use std::path::Path;
use std::process::Command;
use std::sync::Arc;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tracing::{debug, error, info, Level};
use tracing_subscriber::FmtSubscriber;

use server::{get_available_port, get_local_ip, run_server};
use tunnel::{kill_tunnel, start_tunnel};

// Define global task storage
lazy_static::lazy_static! {
    static ref SERVER_TASK: Arc<Mutex<Option<JoinHandle<()>>>> = Arc::new(Mutex::new(None));
}

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
    let success = if kill_tunnel().is_err() {
        error!("Error killing tunnel.");
        false
    } else {
        true
    };

    match stop_server().await {
        Ok(_) => Ok(success),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn serve(
    path: String,
    is_public: bool,
    username: Option<String>,
    password: Option<String>,
) -> Result<SharedPayload, ()> {
    let _ = stop().await;

    let path_str = path.clone();
    let port = get_available_port().unwrap_or(8765);
    let localhost = IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1));
    let local_ip = get_local_ip().unwrap_or(localhost);

    let success = Arc::new(Mutex::new(true));
    let server_task = tokio::spawn({
        let path_str = path_str.clone();
        let success_clone = Arc::clone(&success);

        async move {
            if let Err(e) = run_server(path_str, port, username, password).await {
                *success_clone.lock().await = false;
                error!("Error running server: {:?}", e);
            }
        }
    });

    *SERVER_TASK.lock().await = Some(server_task);

    let is_directory = Path::new(&path_str).is_dir();
    let mut final_url = format!("http://{}:{}", local_ip, port);

    let final_success = if *success.lock().await && is_public {
        match start_tunnel(port) {
            Ok(tunnel_url) => {
                info!("Started tunnel correctly");
                final_url = tunnel_url;
                true
            }
            Err(error) => {
                error!("Error starting tunnel: {}", error);
                false
            }
        }
    } else {
        *success.lock().await
    };

    Ok(SharedPayload {
        path: path_str,
        url: final_url,
        success: final_success,
        is_directory,
    })
}

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set global default subscriber");

    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![log, stop, serve, open])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
