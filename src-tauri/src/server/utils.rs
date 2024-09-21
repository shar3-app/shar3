use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use chrono::{DateTime, Local, Utc};
use std::fs::{read_to_string, File};
use std::io::{self, Error, Read};
use std::path::Path;
use std::result::Result;
use std::time::SystemTime;

pub fn remove_last_char(s: &str) -> String {
    if s.is_empty() || !s.ends_with("/") {
        s.to_string()
    } else {
        s[..s.len() - 1].to_string()
    }
}

pub fn format_time(result: Result<SystemTime, Error>) -> String {
    match result {
        Ok(system_time) => {
            // Convert SystemTime to DateTime<Utc>
            let datetime: DateTime<Utc> = system_time.into();

            // Convert to local time
            let local_datetime: DateTime<Local> = datetime.with_timezone(&Local);

            // Format the date as "Sep 24 at 16:45"
            local_datetime.format("%b %d at %H:%M").to_string()
        }
        Err(_) => String::new(),
    }
}

pub fn read_file_content(file_path: &str) -> io::Result<String> {
    let path = Path::new(file_path);

    // Read the SVG file content as a string
    let svg_content = read_to_string(path)?;
    Ok(svg_content)
}

// Function to read a file and return its Base64 representation
pub fn file_to_base64(file_path: &str) -> io::Result<String> {
    // Open the file
    let mut file = File::open(file_path)?;

    // Read the file contents into a vector of bytes
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Encode the file contents to base64 using STANDARD engine
    let base64_string = STANDARD.encode(&buffer);

    Ok(base64_string)
}
