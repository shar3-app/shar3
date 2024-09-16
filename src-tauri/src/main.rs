// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod utils;

use utils::{format_time};
use warp::Filter;
use std::path::Path;
use std::fs;
use warp::http::Response;
use warp::hyper::Body;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn serve(path: String) -> () {
  run_server(path).await;
}

async fn run_server(path: String) -> Result<(), warp::Rejection> {
    let path_clone = path.clone();

    let static_files = warp::fs::dir(path).or(warp::path::end().and_then(move || {
        // Move the path_clone into the closure so it can be used as an owned `String`
        let path_for_closure = path_clone.clone();
        async move {
            list_directory_contents(&path_for_closure).await
        }
    }));

    warp::serve(static_files).run(([127, 0, 0, 1], 1234)).await;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![serve])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn list_directory_contents(path: &str) -> Result<impl warp::Reply, warp::Rejection> {
    let path = Path::new(path);

    if !path.is_dir() {
        return Err(warp::reject::not_found());
    }

    let mut html = String::from("<html><body><h1>Index of ");
    html.push_str(path.display().to_string().as_str());
    html.push_str("</h1><table><thead><tr><th>Name</th><th>Size</th><th>Last modification</th></tr></thead><tbody>");

    // Iterate over the directory
    let entries = fs::read_dir(path)
        .map_err(|_| warp::reject::not_found())
        .and_then(|entries| {
            entries
                .map(|entry| {
                    let entry = entry.map_err(|_| warp::reject::not_found())?;
                    let path = entry.path();
                    let name = path.file_name().unwrap_or_default().to_string_lossy();
                    let size = path.metadata().unwrap().len();
                    let modified = path.metadata().unwrap().modified();

                    let mut link = String::new();
                    if path.is_dir() {
                        link.push_str("<tr><td><a href=\"");
                        link.push_str(name.as_ref());
                        link.push_str("/\">");
                        link.push_str(name.as_ref());
                        link.push_str("/</a></td><td></td><td>");
                        link.push_str(&format_time(modified));
                        link.push_str("</td></tr>");
                    } else {
                        link.push_str("<tr><td><a href=\"");
                        link.push_str(name.as_ref());
                        link.push_str("\">");
                        link.push_str(name.as_ref());
                        link.push_str("</a></td><td>");
                        link.push_str(&size.to_string());
                        link.push_str(" bytes</td><td>");
                        link.push_str(&format_time(modified));
                        link.push_str("</td></tr>");
                    }

                    Ok(link)
                })
                .collect::<Result<Vec<_>, warp::Rejection>>()
        })?;

    html.push_str(&entries.concat());
    html.push_str("</tbody></table></body></html>");

    Ok(Response::builder()
        .header("Content-Type", "text/html")
        .body(Body::from(html))
        .unwrap())
}
