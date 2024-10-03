use bore_cli::client::Client;
use once_cell::sync::Lazy;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    mpsc, Arc, Mutex,
};
use tokio::runtime::Runtime;
use tracing::info;

static GLOBAL_TUNNEL: Lazy<Arc<Mutex<Option<(Runtime, Arc<AtomicBool>)>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));

pub fn start_tunnel(port: u16) -> Result<String, anyhow::Error> {
    let (tx, rx) = mpsc::channel();
    let mut global_tunnel_lock = GLOBAL_TUNNEL.lock().unwrap();

    if global_tunnel_lock.is_some() {
        return Err(anyhow::Error::msg("Tunnel is already running."));
    }

    let runtime = Runtime::new().expect("Failed to create Tokio runtime");
    let stop_signal = Arc::new(AtomicBool::new(false));
    let client_stop_signal = Arc::clone(&stop_signal);

    let client_future = async move {
        let client = Client::new(
            "localhost",
            port,
            "tunnel.shar3.app",
            0,
            Some("5h4r3-secret_2O24"),
        )
        .await?;
        let remote_url = format!("http://{}.shar3.app", client.remote_port());
        tx.send(remote_url).expect("Failed to send URL");

        tokio::select! {
            _ = client.listen() => {},
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
        Err(e) => Err(anyhow::Error::msg(format!("Failed to receive URL: {}", e))),
    }
}

pub fn kill_tunnel() -> Result<(), anyhow::Error> {
    let mut tunnel_lock = GLOBAL_TUNNEL.lock().unwrap();

    if let Some((runtime, stop_signal)) = tunnel_lock.take() {
        stop_signal.store(true, Ordering::Relaxed);
        runtime.shutdown_background();
        info!("Tunnel stopped.");
    } else {
        info!("No tunnel is running.");
    }

    Ok(())
}
