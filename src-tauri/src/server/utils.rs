use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use chrono::{DateTime, Local, Utc};
use percent_encoding::percent_decode_str;
use serde_json::json;
use std::fs::{read_to_string, File};
use std::io::{self, Error, Read};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use tauri::AppHandle;
use tauri_plugin_aptabase::EventTracker;
use tokio_util::io::ReaderStream;
use warp::hyper::header::{HeaderValue, CONTENT_DISPOSITION, CONTENT_LENGTH};
use warp::hyper::Body;
use warp::reply::Response;

pub fn remove_last_char(s: &str) -> String {
    if s.ends_with('/') {
        s[..s.len() - 1].to_string()
    } else {
        s.to_string()
    }
}

pub fn format_time(result: Result<SystemTime, Error>) -> String {
    result
        .ok()
        .map(|system_time| {
            let datetime: DateTime<Utc> = system_time.into();
            let local_datetime: DateTime<Local> = datetime.with_timezone(&Local);
            local_datetime.format("%b %d at %H:%M").to_string()
        })
        .unwrap_or_else(String::new)
}

pub fn read_file_content(file_path: &str) -> io::Result<String> {
    read_to_string(Path::new(file_path))
}

pub fn decode_percent_encoded_path(encoded: &str) -> String {
    percent_decode_str(encoded).decode_utf8_lossy().to_string()
}

pub fn get_filename(path: &Path) -> String {
    path.file_name()
        .and_then(|os_str| os_str.to_str())
        .map(decode_percent_encoded_path)
        .unwrap_or_else(|| String::from("filename"))
}

pub fn file_to_base64(file_path: &str) -> io::Result<String> {
    let decoded_path = decode_percent_encoded_path(file_path);
    let mut file = File::open(decoded_path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    Ok(STANDARD.encode(&buffer))
}

pub fn format_bytes(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;
    const TB: u64 = GB * 1024;
    const PB: u64 = TB * 1024;

    match bytes {
        b if b >= PB => format!("{:.2} PB", b as f64 / PB as f64),
        b if b >= TB => format!("{:.2} TB", b as f64 / TB as f64),
        b if b >= GB => format!("{:.2} GB", b as f64 / GB as f64),
        b if b >= MB => format!("{:.2} MB", b as f64 / MB as f64),
        b if b >= KB => format!("{:.2} KB", b as f64 / KB as f64),
        _ => format!("{} B", bytes),
    }
}

pub async fn stream_file(
    app: &AppHandle,
    file_path: String,
) -> Result<impl warp::Reply, warp::Rejection> {
    let path = PathBuf::from(&file_path);

    // Get file metadata to obtain the file size
    let metadata = tokio::fs::metadata(&path)
        .await
        .map_err(|_| warp::reject::not_found())?;
    let file_size = metadata.len(); // File size in bytes

    let file = tokio::fs::File::open(path.clone())
        .await
        .map_err(|_| warp::reject::not_found())?;
    let stream = ReaderStream::new(file);

    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("file");

    // Set Content-Disposition header for downloading the file
    let content_disposition =
        HeaderValue::from_str(&format!("attachment; filename=\"{}\"", file_name))
            .unwrap_or_else(|_| HeaderValue::from_static("attachment"));

    // Set Content-Length header to the size of the file
    let content_length = HeaderValue::from_str(&file_size.to_string())
        .unwrap_or_else(|_| HeaderValue::from_static("0"));

    app.track_event(
        "download",
        Some(json!({
            "file_name": file_name,
            "size": &file_size.to_string(),
        })),
    );

    // Create the response and add headers
    let mut response = Response::new(Body::wrap_stream(stream));
    let headers = response.headers_mut();
    headers.insert(CONTENT_DISPOSITION, content_disposition);
    headers.insert(CONTENT_LENGTH, content_length); // Adding the Content-Length header

    Ok(response)
}
