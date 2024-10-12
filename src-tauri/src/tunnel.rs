use once_cell::sync::Lazy;
use std::process::{Child, Command, Stdio};
use std::{
    io::{BufRead, BufReader, Error, ErrorKind},
    sync::{mpsc, Arc, Mutex},
};
use tracing::{error, info};

static GLOBAL_TUNNEL: Lazy<Arc<Mutex<Option<Child>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));

fn extract_url(line: &str) -> Option<String> {
    line.find("http").and_then(|start| {
        line.find(".serveo.net")
            .map(|end| line[start..=end + 10].to_string())
    })
}

pub fn start_tunnel(port: u16) -> Result<String, Error> {
    // Create a channel to communicate the URL
    let (tx, rx) = mpsc::channel();

    // Lock the global child process
    let mut global_child_lock = GLOBAL_TUNNEL.lock().unwrap();

    // Check if a tunnel process is already running
    if global_child_lock.is_some() {
        return Err(Error::new(
            ErrorKind::AlreadyExists,
            "Tunnel is already running.",
        ));
    }

    let mut child = Command::new("ssh")
        .arg("-o")
        .arg("StrictHostKeyChecking=no")
        .arg("-T")
        .arg("-R")
        .arg(format!("80:localhost:{}", port))
        .arg("serveo.net")
        .stdout(Stdio::piped()) // Capture the stdout
        .spawn()
        .expect("Failed to start SSH process");
    info!("Tunnel started.");
    let stdout = child.stdout.take().expect("Failed to capture stdout");

    // Store the child process in the global state immediately
    *global_child_lock = Some(child);

    // Spawn a new thread to handle the output reading
    let tx = tx.clone();
    std::thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let line = match line {
                Ok(l) => l,
                Err(e) => {
                    error!("Error reading line: {}", e);
                    continue;
                }
            };

            if line.trim_end().ends_with("serveo.net") {
                if let Some(url) = extract_url(&line) {
                    tx.send(url).expect("Failed to send URL");
                    break;
                }
            }
        }
    });

    // Wait for the URL to be received from the channel
    match rx.recv() {
        Ok(url) => Ok(url),
        Err(e) => Err(Error::new(
            ErrorKind::NotFound,
            format!("Failed to receive URL: {}", e),
        )),
    }
}

pub fn kill_tunnel() -> Result<(), anyhow::Error> {
    let mut tunnel_lock = GLOBAL_TUNNEL.lock().unwrap();

    if let Some(mut child) = tunnel_lock.take() {
        child.kill()?; // Kill the process
        info!("Tunnel stopped.");
    } else {
        info!("No tunnel is running.");
    }

    Ok(())
}
