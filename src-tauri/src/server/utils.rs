use base64::engine::general_purpose::STANDARD;
use base64::Engine;
use chrono::{DateTime, Local, Utc};
use percent_encoding::percent_decode_str;
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

pub fn decode_percent_encoded_path(encoded: &str) -> String {
    percent_decode_str(encoded).decode_utf8_lossy().to_string()
}

pub fn get_filename(path: &Path) -> String {
    if let Some(filename) = path.file_name().and_then(|os_str| os_str.to_str()) {
        decode_percent_encoded_path(filename)
    } else {
        String::from("filename")
    }
}

// Function to read a file and return its Base64 representation
pub fn file_to_base64(file_path: &str) -> io::Result<String> {
    let decoded_path = decode_percent_encoded_path(file_path);

    // Open the file
    let mut file = File::open(&decoded_path)?;

    // Read the file contents into a vector of bytes
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Encode the file contents to base64 using STANDARD engine
    let base64_string = STANDARD.encode(&buffer);

    Ok(base64_string)
}
