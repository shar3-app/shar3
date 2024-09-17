use chrono::{DateTime, Local, Utc};
use std::path::Path;
use std::time::SystemTime;
use std::result::Result;
use std::fs;
use std::fs::File;
use std::io::{self, Read, Error};
use base64::encode;

pub fn remove_last_char(s: &str) -> String {
    if s.is_empty() {
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

// Function to read a file and return its Base64 representation
pub fn file_to_base64(file_path: &str) -> io::Result<String> {
    // Open the file
    let mut file = File::open(file_path)?;

    // Read the file contents into a vector of bytes
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;

    // Encode the file contents to base64
    let base64_string = encode(&buffer);

    Ok(base64_string)
}


pub fn format_listing_page(path: &Path) -> Result<String, Error> {
    let mut html = String::from("<html><body><h1>Directory: ");
    html.push_str(path.display().to_string().as_str());
    html.push_str("</h1><table><thead><tr><th>Name</th><th>Size</th><th>Last modification</th></tr></thead><tbody>");

    // Iterate over the directory
    let entries = fs::read_dir(path)?
        .map(|entry| {
            let entry = entry?;
            let path = entry.path();
            let name = path.file_name().unwrap_or_default().to_string_lossy();
            let size = path.metadata()?.len();
            let modified = path.metadata()?.modified();

            let mut link = String::new();
            if path.is_dir() {
                link.push_str("<tr><td><a href=\"");
                link.push_str(&name);
                link.push_str("/\">");
                link.push_str(&name);
                link.push_str("/</a></td><td></td><td>");
                link.push_str(&format_time(modified));
                link.push_str("</td></tr>");
            } else {
                link.push_str("<tr><td><a href=\"");
                link.push_str(&name);
                link.push_str("\">");
                link.push_str(&name);
                link.push_str("</a></td><td>");
                link.push_str(&size.to_string());
                link.push_str(" bytes</td><td>");
                link.push_str(&format_time(modified));
                link.push_str("</td></tr>");
            }

            Ok(link)
        })
        .collect::<Result<Vec<_>, io::Error>>()?;

    html.push_str(&entries.concat());
    html.push_str("</tbody></table></body></html>");

    Ok(html)  // Return the final HTML string
}
