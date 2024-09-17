mod html;

use std::fs::File;
use std::io::Read;
use std::path::Path;
use html::image_html;
use warp::http::Response;
use warp::http::header::CONTENT_TYPE;
use warp::hyper::Body;

use super::utils::format_listing_page;

pub async fn serve_pdf(file_path: &str) -> Result<Response<Body>, warp::Rejection> {
    // Read the file
    let mut file = File::open(file_path).map_err(|_| warp::reject::not_found())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|_| warp::reject::not_found())?;

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
