
mod utils;
mod serving;

use serving::{serve_image, serve_listing, serve_pdf};
use utils::remove_last_char;
use warp::Filter;
use warp::http::Response;
use std::path::{Path, PathBuf};
use warp::hyper::Body;

pub async fn run_server(path: String) -> Result<(), warp::Rejection> {
    let static_files = warp::path::tail()
        .and_then(move |tail: warp::path::Tail| {
            let path_for_closure = path.clone();
            async move {
                // Convert the tail into a string and append it to the base path.
                let mut full_path = PathBuf::from(&path_for_closure);
                full_path.push(tail.as_str());

                // Convert PathBuf to string for `list_directory_contents`.
                if let Some(full_path_str) = full_path.to_str() {
                    list_directory_contents(full_path_str).await
                } else {
                    Err(warp::reject::not_found()) // Handle the case where path conversion fails.
                }
            }
        });

    warp::serve(static_files).run(([127, 0, 0, 1], 1234)).await;

    Ok(())
}

async fn list_directory_contents(selected_path: &str) -> Result<Response<Body>, warp::Rejection> {
    let path = Path::new(selected_path);

    if !path.is_dir() {
        let file_path = remove_last_char(selected_path);

        // Handle the case where the file has no extension
        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
            match ext.to_lowercase().as_str() {
                "pdf" => serve_pdf(&file_path).await,
                "jpg" | "jpeg" | "png" | "gif" | "bmp" => serve_image(&file_path, ext).await,
                _ => serve_pdf(&file_path).await, // Fallback to serving PDF for unsupported types
            }
        } else {
            // If no file extension is found, you can return an error or handle it appropriately
            Err(warp::reject::not_found())
        }
    } else {
        serve_listing(path).await // Return the result of serve_listing
    }
}
