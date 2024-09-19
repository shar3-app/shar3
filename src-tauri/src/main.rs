// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;
mod tunnel;

use std::path::Path;
use std::process::Command;

use server::{get_available_port, run_server};
use tunnel::{kill_tunnel, start_tunnel};
use serde::Serialize;
use tracing::{debug, error, info, Level};
use tracing_subscriber::FmtSubscriber;
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use std::sync::Arc;


// Define global task storage
lazy_static::lazy_static! {
    static ref SERVER_TASK: Arc<Mutex<Option<JoinHandle<()>>>> = Arc::new(Mutex::new(None));
}

async fn stop_server() -> Result<(), String> {
    let mut server_task_lock = SERVER_TASK.lock().await; // Ensure .await is used here
    if let Some(task) = server_task_lock.take() {
        // Abort the task and handle potential errors
        task.abort();
        Ok(()) // Indicate success
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
    is_directory: bool
}

#[tauri::command]
fn open(path: String, os_type: String) {
    if os_type == "Windows_NT" {
        Command::new("explorer")
            .args(["/select,", &path])
            .spawn()
            .unwrap();
    } else {
        Command::new( "open" )
            .args(["-R", &path])
            .spawn()
            .unwrap();
    }
}

#[tauri::command]
fn log(text: String) {
    debug!("[FE LOG]: {}", text);
}

#[tauri::command]
async fn stop() -> Result<bool, bool> {
    let mut success = true;

    if let Err(error_tunnel) = kill_tunnel() {
        success = false;
        error!("Error killing tunnel: {}", error_tunnel);
    }

    match stop_server().await {
        Ok(()) => Ok(success),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn serve(path: String, is_public: bool) -> Result<SharedPayload, ()> {
    let _ = stop().await;
    let success = Arc::new(Mutex::new(true));
    let path_str = path.clone(); // Clone path_str to avoid moving
    let port: u16 = get_available_port().unwrap_or(8765);

    // Spawn the server task and store it globally
    let success_clone = Arc::clone(&success);
    let server_task = tokio::spawn({
        let port = port.clone(); // Clone for use in the async block
        let path_str = path_str.clone();
        async move {
            if let Err(e) = run_server(path_str, port).await {
                let mut success = success_clone.lock().await;
                *success = false;
                error!("Error running server: {:?}", e);
            }
        }
    });

    {
        let mut server_task_lock = SERVER_TASK.lock().await; // Ensure .await is used here
        *server_task_lock = Some(server_task);
    }

    let mut url = String::from(format!("http://localhost:{}", port));

    // Compute whether it's a directory before moving `path_str`
    let is_directory = Path::new(&path_str).is_dir();

    let success = *success.lock().await;
    let mut final_success = success;

    if success && is_public {
        match start_tunnel(port) {
            Ok(result) => {
                info!("Started tunnel correctly");
                url = result;
                final_success = true;
            },
            Err(error) => {
                error!("Error starting tunnel: {}", error);
                url = String::new();
                final_success = false;
            }
        }
    }

    Ok(SharedPayload {
        path: path_str,
        url,
        success: final_success,
        is_directory
    })
}

fn main() {
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::DEBUG)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Failed to set global default subscriber");

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![log, stop, serve, open])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
