mod serving;
mod utils;

use get_if_addrs::get_if_addrs;
use rand::seq::SliceRandom;
use serving::list_directory_contents;
use std::net::IpAddr;
use std::{net::TcpListener, path::PathBuf};
use warp::Filter;

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
    let static_files = warp::path::tail().and_then(move |tail: warp::path::Tail| {
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

    warp::serve(static_files).run(([0, 0, 0, 0], port)).await;
    Ok(())
}
