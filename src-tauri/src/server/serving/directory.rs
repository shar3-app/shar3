use std::io::Error;
use std::path::Path;
use std::{fs, io};

use crate::server::utils::{format_bytes, format_time, get_filename};

pub fn directory_html(path: &Path) -> Result<String, Error> {
    let name = get_filename(path);
    let mut html = String::from(
        "<html><head>
    	<title>",
    );
    html.push_str(&name);
    html.push_str("</title>
     	<style>
    		  body {
		        background-color: #111827;
		        display: flex;
				flex-direction: column;
				width: 900px;
			    max-width: 90%;
			    gap: 1rem;
			    margin: 0 auto;
		        font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";
		      }

		      table {
		        color: white;
		        font-size: rem;
		      }

		      table th {
		        background: #7f5af0;
		        color: white;
		        text-transform: uppercase;
		        font-size: 1rem;
		        padding: 1rem;
		      }

		      td, th {
		        width: 50%;
		      } td:nth-child(2), th:nth-child(2) {
		        width: 20%;
		      } td:nth-child(3), th:nth-child(3) {
		        width: 30%;
		      }

		      table tr {
		        background: rgb(17 24 39)
		      }
		      table tr:nth-child(odd) {
		        background: rgb(55 65 81)
		      }

		      table td:not(:nth-child(1)) {
		        text-align: right;
		      }

		      table td a {
		        color: white;
		      }

		      table td svg {
		        margin-bottom: -.25rem;
		        margin-right: .5rem
		      }

		      table td {
		        padding: 1rem .75rem;
		      }
	      </style>
    </head><body><h1 style=\"color: rgb(156 163 175); font-size: 1.5rem; margin-top: 2rem; \">");
    html.push_str(path.display().to_string().as_str());
    html.push_str("</h1>");
    html.push_str("<table><thead><tr><th>Name</th><th>Size</th><th>Last modification</th></tr></thead><tbody>");

    // Iterate over the directory
    let entries = fs::read_dir(path)?
        .map(|entry| {
            let entry = entry?;
            let path = entry.path();
            let name = path.file_name().unwrap_or_default().to_string_lossy();
            let size = format_bytes(path.metadata()?.len());
            let modified = path.metadata()?.modified();

            let mut link = String::new();
            if path.is_dir() {
                link.push_str("<tr><td><a href=\"");
                link.push_str(&name);
                link.push_str("/\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2\" /></svg>");
                link.push_str(&name);
                link.push_str("/</a></td><td></td><td>");
                link.push_str(&format_time(modified));
                link.push_str("</td></tr>");
            } else {
                link.push_str("<tr><td><a href=\"");
                link.push_str(&name);
                link.push_str("/\"><svg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\" /><path d=\"M14 3v4a1 1 0 0 0 1 1h4\" /><path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" /></svg>");
                link.push_str(&name);
                link.push_str("</a></td><td>");
                link.push_str(&size);
                link.push_str("</td><td>");
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
