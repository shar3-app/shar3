mod directory;
mod file;
mod image;
mod svg;

use directory::directory_html;
use file::file_html;
use image::image_html;
use std::fs::File;
use std::io::Read;
use std::path::Path;
use svg::svg_html;
use warp::http::header::CONTENT_TYPE;
use warp::http::Response;
use warp::hyper::Body;

use super::utils::remove_last_char;

pub async fn render_content(selected_path: &str) -> Result<Response<Body>, warp::Rejection> {
    let path = Path::new(selected_path);
    if !path.is_dir() {
        let file_path = remove_last_char(selected_path);
        match path.extension().and_then(|e| e.to_str()) {
            Some(ext) => match ext.to_lowercase().as_str() {
                "pdf" => serve_pdf(&file_path).await,
                "jpg" | "jpeg" | "png" | "apng" | "gif" | "bmp" | "webp" | "avif" | "tiff"
                | "tif" => serve_image(&file_path, ext).await,
                "svg" => serve_svg(&file_path).await,
                _ => serve_file(&file_path).await,
            },
            None => Err(warp::reject::not_found()),
        }
    } else {
        serve_listing(path).await
    }
}

async fn serve_pdf(file_path: &str) -> Result<Response<Body>, warp::Rejection> {
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

async fn serve_listing(path: &Path) -> Result<Response<Body>, warp::Rejection> {
    let html = match directory_html(path) {
        Ok(listing) => listing,
        Err(_) => String::from("An error ocurred"),
    };

    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}

async fn serve_image(path: &str, ext: &str) -> Result<Response<Body>, warp::Rejection> {
    let html = match image_html(path, ext) {
        Ok(image_html) => image_html,
        Err(_) => String::from("An error ocurred"),
    };
    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}

async fn serve_svg(path: &str) -> Result<Response<Body>, warp::Rejection> {
    let html = match svg_html(path) {
        Ok(svg_html) => svg_html,
        Err(_) => String::from("An error ocurred"),
    };
    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}

async fn serve_file(path: &str) -> Result<Response<Body>, warp::Rejection> {
    let html = match file_html(path) {
        Ok(file_html) => file_html,
        Err(_) => String::from("An error ocurred"),
    };
    Ok(Response::builder()
        .header(CONTENT_TYPE, "text/html")
        .body(Body::from(html))
        .unwrap())
}
