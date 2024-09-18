use std::process::{Command, Child, Stdio};
use std::sync::{mpsc, Arc, Mutex};
use std::io::{self, BufRead, BufReader};
use lazy_static::lazy_static;
use std::sync::Once;

lazy_static! {
    static ref GLOBAL_CHILD: Arc<Mutex<Option<Child>>> = Arc::new(Mutex::new(None));
    static ref INIT: Once = Once::new();
}

fn extract_url(line: &str) -> Option<String> {
    if let Some(start) = line.find("http") {
        if let Some(end) = line.find(".serveo.net") {
            return Some(line[start..=end + 10].to_string()); // end + 10 accounts for ".serveo.net"
        }
    }
    None
}

pub fn start_tunnel() -> Result<String, io::Error> {
    // Create a channel to communicate the URL
    let (tx, rx) = mpsc::channel();

    // Ensure initialization happens only once
    INIT.call_once(|| {
        let mut child = Command::new("ssh")
            .arg("-R")
            .arg("80:localhost:1234")
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
                        eprintln!("Error reading line: {}", e);
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
        Err(e) => Err(io::Error::new(io::ErrorKind::NotFound, format!("Failed to receive URL: {}", e))),
    }
}

pub fn kill_tunnel() -> io::Result<()> {
    let mut child_lock = GLOBAL_CHILD.lock().unwrap();
    if let Some(mut child) = child_lock.take() {
        child.kill()?; // Kill the process
        println!("Tunnel process killed.");
    } else {
        println!("No tunnel process to kill.");
    }
    Ok(())
}
