use std::process::{Command, Stdio};
use std::io::{self, BufRead, BufReader};

fn extract_url(line: &str) -> Option<String> {
    // Look for the part that starts with "http" and ends with ".serveo.net"
    if let Some(start) = line.find("http") {
        if let Some(end) = line.find(".serveo.net") {
            // Return the trimmed URL
            return Some(line[start..=end + 10].to_string()); // end + 10 accounts for ".serveo.net"
        }
    }
    None
}

pub fn localtunnel() -> Result<String, io::Error> {
    // Spawn the SSH command
    let mut child = Command::new("ssh")
        .arg("-R")
        .arg("80:localhost:1234")
        .arg("serveo.net")
        .stdout(Stdio::piped()) // Capture the stdout
        .spawn()?;

    // Read the output from stdout
    if let Some(stdout) = child.stdout.take() {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            let line = line?; // Unwrap the line result

            // Check if the line ends with "serveo.net"
            if line.trim_end().ends_with("serveo.net") {
                // Extract the URL
                if let Some(url) = extract_url(&line) {
                    return Ok(url); // Return the extracted URL
                }
            }
        }
    }

    // If no matching line is found, return an error or default value
    Err(io::Error::new(io::ErrorKind::NotFound, "ERROR"))
}
