mod serving;
mod utils;

use get_if_addrs::get_if_addrs;
use rand::seq::SliceRandom;
use serde::Deserialize;
use serving::render_content;
use std::net::IpAddr;
use std::{net::TcpListener, path::PathBuf};
use utils::{decode_percent_encoded_path, stream_file};
use warp::http::StatusCode;
use warp::Filter;

// Struct to parse the query parameter for the file path
#[derive(Debug, Deserialize)]
struct DownloadQuery {
    file_path: String, // full path to the file that needs to be downloaded
}

pub fn get_local_ip() -> Option<IpAddr> {
    get_if_addrs().ok().and_then(|interfaces| {
        interfaces
            .into_iter()
            .find(|iface| !iface.is_loopback())
            .map(|iface| iface.ip())
    })
}

pub fn get_available_port() -> Option<u16> {
    let mut ports: Vec<u16> = (8000..9000).collect();
    ports.shuffle(&mut rand::thread_rng());

    ports.into_iter().find(|port| port_is_available(*port))
}

fn port_is_available(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_ok()
}

pub async fn run_server(path: String, port: u16) -> Result<(), warp::Rejection> {
    // Route for serving static files or directory content
    let static_files = warp::path::tail().and_then(move |tail: warp::path::Tail| {
        let path_for_closure = path.clone();
        async move {
            // Convert the tail into a string and append it to the base path.
            let mut full_path = PathBuf::from(&path_for_closure);
            full_path.push(decode_percent_encoded_path(tail.as_str()));

            if let Some(full_path_str) = full_path.to_str() {
                render_content(full_path_str).await
            } else {
                Err(warp::reject::not_found()) // Handle the case where path conversion fails.
            }
        }
    });

    // Route for downloading a file given a full path in the query
    let download_route = warp::path("d0wnl04d_f1l3")
        .and(warp::query::<DownloadQuery>())
        .and_then(move |query: DownloadQuery| {
            let file_path = query.file_path.clone();
            async move { stream_file(file_path).await }
        });

    // Combine routes
    let routes = static_files.or(download_route);

    warp::serve(routes).run(([0, 0, 0, 0], port)).await;
    Ok(())
}
