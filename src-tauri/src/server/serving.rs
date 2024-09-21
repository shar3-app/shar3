mod html;

use html::{format_listing_page, image_html};
use std::fs::File;
use std::io::Read;
use std::path::Path;
use warp::http::header::CONTENT_TYPE;
use warp::http::Response;
use warp::hyper::Body;

use super::utils::remove_last_char;

pub async fn serve_pdf(file_path: &str) -> Result<Response<Body>, warp::Rejection> {
    // Read the file
    let mut file = File::open(file_path).map_err(|_| warp::reject::not_found())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|_| warp::reject::not_found())?;

    // Create a response with the appropriate content type for PDF
    Ok(Response::builder()
        .header(CONTENT_TYPE, "application/pdf")
        .body(Body::from(buffer))
        .unwrap())
}

pub async fn serve_listing(path: &Path) -> Result<Response<Body>, warp::Rejection> {
    let html;
    match format_listing_page(path) {
        Ok(listing) => html = listing,
        Err(_) => html = String::from("An error ocurred"),
    }

    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}

pub async fn list_directory_contents(
    selected_path: &str,
) -> Result<Response<Body>, warp::Rejection> {
    let path = Path::new(selected_path);
    if !path.is_dir() {
        let file_path = remove_last_char(selected_path);
        match path.extension().and_then(|e| e.to_str()) {
            Some(ext) => match ext.to_lowercase().as_str() {
                "pdf" => serve_pdf(&file_path).await,
                "jpg" | "jpeg" | "png" | "gif" | "bmp" => serve_image(&file_path, ext).await,
                _ => serve_pdf(&file_path).await,
            },
            None => Err(warp::reject::not_found()),
        }
    } else {
        serve_listing(path).await
    }
}

pub async fn serve_image(path: &str, ext: &str) -> Result<Response<Body>, warp::Rejection> {
    let html;
    match image_html(path, ext) {
        Ok(image_html) => html = image_html,
        Err(_) => html = String::from("An error ocurred"),
    }
    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}
