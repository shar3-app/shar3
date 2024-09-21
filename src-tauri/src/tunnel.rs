use lazy_static::lazy_static;
use std::io::{self, BufRead, BufReader};
use std::process::{Child, Command, Stdio};
use std::sync::Once;
use std::sync::{mpsc, Arc, Mutex};
use tracing::{error, info};

lazy_static! {
    static ref GLOBAL_CHILD: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    static ref INIT: Once = Once::new();
}

fn extract_url(line: &str) -> Option<String> {
    line.find("http").and_then(|start| {
        line.find(".serveo.net")
            .map(|end| line[start..=end + 10].to_string())
    })
}

pub fn start_tunnel(port: u16) -> Result<String, io::Error> {
    // Create a channel to communicate the URL
    let (tx, rx) = mpsc::channel();

    // Ensure initialization happens only once
    INIT.call_once(|| {
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

        let stdout = child.stdout.take().expect("Failed to capture stdout");

        // Store the child process in the global state immediately
        let mut global_child_lock = GLOBAL_CHILD.lock().unwrap();
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
    });

    // Wait for the URL to be received from the channel
    match rx.recv() {
        Ok(url) => Ok(url),
        Err(e) => Err(io::Error::new(
            io::ErrorKind::NotFound,
            format!("Failed to receive URL: {}", e),
        )),
    }
}

pub fn kill_tunnel() -> io::Result<()> {
    let mut child_lock = GLOBAL_CHILD.lock().unwrap();
    if let Some(mut child) = child_lock.take() {
        child.kill()?; // Kill the process
        info!("Tunnel process killed.");
    } else {
        info!("No tunnel process to kill.");
    }
    Ok(())
}
