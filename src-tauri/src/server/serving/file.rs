use std::io::Error;
use std::path::Path;

use crate::server::utils::get_filename;

pub fn file_html(path_str: &str) -> Result<String, Error> {
    let path = Path::new(path_str);
    let name = get_filename(path);

    // TODO loader while downloading

    let mut html = String::from("
        <html>
        <head>
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />
            <title>");
    html.push_str(&name);
    html.push_str("</title>
            <style>
                body { background-color: #111827; margin: 0; font-family: ui-sans-serif, system-ui, sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\"; }
                #download { background-color: #7f5af0; transition: background 150ms; border-radius: .35rem; cursor: pointer; border: none; padding: .75rem; display: flex; justify-content: center; align-items: center; font-size: .75rem; font-weight: bold; color: white; font-family: sans-serif; text-decoration: none; }
                #download:hover { background: #6546c3; }
            </style>
        </head>
        <body style=\"display: flex; justify-content: center; align-items: center\">
        	<div style=\"display: flex; justify-content: center; align-items: center; gap: .75rem; flex-direction: column;\">
         		<svg width=\"256\" height=\"256\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7f5af0\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
           			<path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/>
              		<path d=\"M14 3v4a1 1 0 0 0 1 1h4\" />
                	<path d=\"M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z\" />
                </svg>
                <h1 style=\"color: rgb(156 163 175); font-size: 1.5rem; margin: .5rem; \">");
    html.push_str(&name);
    html.push_str("</h1>
        		<button id=\"download\">Download file</button>
         	</div>

            <script>
	            async function download() {
	                // Define the file path (this should be dynamic based on the file you want to download)
	                const filePath = '");
    html.push_str(path_str);
    html.push_str(
        ";';  // Example path

	                // Create the download URL for your endpoint
	                const downloadUrl = `http://${location.host}",
    );
    html.push_str("/d0wnl04d_f1l3?file_path=${encodeURIComponent('");
    html.push_str(path_str);
    html.push_str(
    				"')}`;

	                // Make the request to the download endpoint
	                try {
	                    const response = await fetch(downloadUrl);

	                    if (!response.ok) {
	                        throw new Error('Failed to download the file');
	                    }

	                    // Extract the filename from the Content-Disposition header
	                    const contentDisposition = response.headers.get('Content-Disposition');
	                    const filename = contentDisposition
	                        ? contentDisposition.match(/filename=\"(.+)\"/)[1]
	                        : 'downloaded_file.txt';

	                    // Convert the response to a Blob
	                    const blob = await response.blob();

	                    // Create a hidden anchor element and trigger a download
	                    const link = document.createElement('a');
	                    link.style.display = 'none';
	                    link.href = window.URL.createObjectURL(blob);
	                    link.download = filename;

	                    // Append to the body, trigger the click, and remove the element
	                    document.body.appendChild(link);
	                    link.click();
	                    document.body.removeChild(link);
	                } catch (error) {
	                    alert('Error downloading file: ', error);
	                }
	            }

                document.getElementById('download').addEventListener('click', async () => await download())
            </script>
        </body>
        </html>
    ",
    );

    Ok(html)
}
