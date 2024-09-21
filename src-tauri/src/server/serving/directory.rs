use std::io::Error;
use std::path::Path;
use std::{fs, io};

use crate::server::utils::format_time;

pub fn directory_html(path: &Path) -> Result<String, Error> {
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

    Ok(html) // Return the final HTML string
}
