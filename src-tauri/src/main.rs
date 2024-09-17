// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod server;
mod tunnel;

use server::run_server;
use tunnel::localtunnel;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn serve(path: String) -> String {
    let _ = run_server(path).await; // Ignore the result of run_server since it returns `()`

    match localtunnel() {
        Ok(result) => result,  // Return the result from localtunnel
        Err(_) => String::from("ERROR"), // Return an error message if localtunnel fails
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![serve])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
