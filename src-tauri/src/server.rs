mod serving;
mod utils;

use base64::{engine::general_purpose::STANDARD, Engine};
use rand::seq::SliceRandom;
use serde::Deserialize;
use serving::render_content;
use std::convert::Infallible;
use std::{net::TcpListener, path::PathBuf};
use utils::{decode_percent_encoded_path, stream_file};
use warp::http::header::HeaderValue;
use warp::http::Response as HttpResponse;
use warp::http::StatusCode;
use warp::hyper::Body;
use warp::{Filter, Rejection, Reply};

#[derive(Debug, Deserialize)]
struct DownloadQuery {
    file_path: String,
}

pub fn get_available_port() -> Option<u16> {
    let mut ports: Vec<u16> = (1024..49151).collect();
    ports.shuffle(&mut rand::thread_rng());
    ports.into_iter().find(|port| port_is_available(*port))
}

fn port_is_available(port: u16) -> bool {
    TcpListener::bind(("127.0.0.1", port)).is_ok()
}

fn with_auth(
    username: Option<String>,
    password: Option<String>,
) -> impl Filter<Extract = (), Error = Rejection> + Clone {
    let user = username.unwrap_or_default();
    let pwd = password.unwrap_or_default();
    let has_auth = !user.is_empty() && !pwd.is_empty();

    warp::header::optional::<HeaderValue>("authorization")
        .and_then(move |auth_header: Option<HeaderValue>| {
            let user = user.clone();
            let pwd = pwd.clone();
            async move {
                if !has_auth {
                    return Ok::<(), Rejection>(());
                }

                if let Some(header_value) = auth_header {
                    if let Ok(auth_str) = header_value.to_str() {
                        let base64_encoded = auth_str.trim_start_matches("Basic ");
                        if let Ok(decoded) = STANDARD.decode(base64_encoded) {
                            let decoded_str = String::from_utf8(decoded).unwrap_or_default();
                            let credentials = decoded_str.splitn(2, ':').collect::<Vec<&str>>();
                            if credentials.len() == 2
                                && credentials[0] == user
                                && credentials[1] == pwd
                            {
                                return Ok(());
                            }
                        }
                    }
                }

                Err(warp::reject::custom(Unauthorized))
            }
        })
        .untuple_one()
}

#[derive(Debug)]
struct Unauthorized;
impl warp::reject::Reject for Unauthorized {}

async fn handle_rejection(err: Rejection) -> Result<impl Reply, Infallible> {
    if err.find::<Unauthorized>().is_some() {
        let response = HttpResponse::builder()
            .status(StatusCode::UNAUTHORIZED)
            .header("WWW-Authenticate", r#"Basic realm="restricted area""#)
            .body(Body::from("Unauthorized"))
            .unwrap();

        return Ok(response);
    }

    let response = HttpResponse::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .body(Body::from("Something went wrong"))
        .unwrap();

    Ok(response)
}

pub async fn run_server(
    path: String,
    port: u16,
    username: Option<String>,
    password: Option<String>,
) -> Result<(), Rejection> {
    let download_route = warp::path("d0wnl04d_f1l3")
        .and(warp::query::<DownloadQuery>())
        .and_then(move |query: DownloadQuery| {
            let file_path = query.file_path.clone();
            async move { stream_file(file_path).await }
        });

    let static_files = warp::path::tail().and_then(move |tail: warp::path::Tail| {
        let path_for_closure = path.clone();
        async move {
            let mut full_path = PathBuf::from(&path_for_closure);
            full_path.push(decode_percent_encoded_path(tail.as_str()));

            if let Some(full_path_str) = full_path.to_str() {
                render_content(full_path_str).await
            } else {
                Err(warp::reject::not_found())
            }
        }
    });

    let auth_filter = with_auth(username, password);
    let routes = auth_filter
        .and(download_route.or(static_files))
        .recover(handle_rejection);

    warp::serve(routes).run(([0, 0, 0, 0], port)).await;
    Ok(())
}
