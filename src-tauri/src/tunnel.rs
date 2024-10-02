use anyhow::{anyhow, Result};
use bore_cli::client::Client;
use lazy_static::lazy_static;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use tokio::runtime::Runtime;
use tracing::info;

lazy_static! {
    static ref GLOBAL_TUNNEL: Arc<Mutex<Option<(Runtime, Arc<AtomicBool>)>>> =
        Arc::new(Mutex::new(None));
}

/// Start a tunnel using bore-cli client and return the remote URL.
pub fn start_tunnel(port: u16) -> Result<String, anyhow::Error> {
    let (tx, rx) = mpsc::channel();

    let mut global_tunnel_lock = GLOBAL_TUNNEL.lock().unwrap();

    if global_tunnel_lock.is_some() {
        return Err(anyhow!("Tunnel is already running."));
    }

    let runtime = Runtime::new().expect("Failed to create Tokio runtime");

    let stop_signal = Arc::new(AtomicBool::new(false));
    let client_stop_signal = stop_signal.clone();

    let client_future = async move {
        // Create the client directly
        let client = Client::new(
            "localhost",
            port,
            "tunnel.shar3.app",
            0,
            Some("5h4r3-secret_2O24"),
        )
        .await?;

        // Create the remote URL and send it over the channel
        let remote_url = format!("http://{}.shar3.app", client.remote_port());
        tx.send(remote_url).expect("Failed to send URL");

        // Now, instead of looping and calling listen() repeatedly,
        // we run listen() once in this async task. The task owns the client.
        tokio::select! {
            _ = client.listen() => {},
            // Stop the client if we receive the signal
            _ = async {
                while !client_stop_signal.load(Ordering::Relaxed) {
                    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
                }
            } => {
                info!("Stopping the client.");
            }
        }

        Ok::<(), anyhow::Error>(())
    };

    runtime.spawn(client_future);

    *global_tunnel_lock = Some((runtime, stop_signal));

    match rx.recv() {
        Ok(url) => Ok(url),
        Err(e) => Err(anyhow!("Failed to receive URL: {}", e)),
    }
}

/// Kill the running tunnel gracefully.
pub fn kill_tunnel() -> Result<(), anyhow::Error> {
    let mut tunnel_lock = GLOBAL_TUNNEL.lock().unwrap();

    if let Some((runtime, stop_signal)) = tunnel_lock.take() {
        stop_signal.store(true, Ordering::Relaxed); // Signal the client to stop
        runtime.shutdown_background(); // Shutdown the runtime gracefully
        info!("Tunnel stopped.");
    } else {
        info!("No tunnel is running.");
    }

    Ok(())
}
