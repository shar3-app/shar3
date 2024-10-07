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
    html.push_str(
        "</h1>
        		<button id=\"download\">Download file</button>
         	</div>

          	<div id=\"download-progress\" style=\"position: absolute; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,.75); display: flex;flex-direction: column; gap: 1.5rem; justify-content: center; align-items: center; display: none; color: white;\">
	          	<div>Downloading...</div>
				<div id=\"download-percentage\" style=\"background: #7f5af0; height: 5rem; font-weight: bold; width: 5rem; display: flex; justify-content: center; align-items: center; font-size: 1.25rem; border-radius: 50%; font-size: 1.25rem;\"></div>
            </div>

            <script>
	           	async function download() {
		            const downloadUrl = `${location.origin}",
    );
    html.push_str("/d0wnl04d_f1l3?file_path=${encodeURIComponent('");
    html.push_str(path_str);
    html.push_str("')}`;

	                try {
	                    const response = await fetch(downloadUrl);

	                    if (!response.ok) {
	                        throw new Error('Failed to download the file');
	                    }

	                    // Extract filename from Content-Disposition header or use a default
	                    const contentDisposition = response.headers.get('Content-Disposition');
	                    const filename = contentDisposition
	                        ? contentDisposition.match(/filename=\"(.+)\"/)[1]
	                        : 'downloaded_file.mp4';

	                    // Get the total file size from Content-Length header (if available)
	                    const contentLength = response.headers.get('Content-Length');
	                    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

	                    // Create a progress bar if you want to display progress (optional)
	                    const progressElement = document.getElementById('download-progress');
	                    const percentageElement = document.getElementById('download-percentage');
						progressElement.style.display = 'flex';

	                    // Create a stream reader
	                    const reader = response.body.getReader();
	                    let receivedBytes = 0;

	                    // Use Uint8Array to store the incoming bytes
	                    const chunks = [];

	                    // Read the stream chunk by chunk
	                    while (true) {
	                        const { done, value } = await reader.read();

	                        if (done) {
	                            break; // Stream has finished
	                        }

	                        // Add the chunk to the array of chunks
	                        chunks.push(value);
	                        receivedBytes += value.length;

	                        // Calculate the download progress
	                        if (totalBytes) {
	                            const percentage = Math.floor((receivedBytes / totalBytes) * 100);
	                            percentageElement.textContent = `${percentage}%`;
	                        } else {
	                            percentageElement.textContent = `Downloading...`;
	                        }
	                    }

	                    // Combine all the chunks into a single Uint8Array
	                    const blobData = new Uint8Array(receivedBytes);
	                    let position = 0;
	                    for (const chunk of chunks) {
	                        blobData.set(chunk, position);
	                        position += chunk.length;
	                    }

	                    // Create a Blob from the combined data
	                    const blob = new Blob([blobData]);

	                    // Trigger a download in the browser
	                    const link = document.createElement('a');
	                    link.href = URL.createObjectURL(blob);
	                    link.download = filename;
	                    document.body.appendChild(link);
	                    link.click();
	                    document.body.removeChild(link);

						// Reset elements
						percentageElement.textContent = '';
						progressElement.style.display = 'none';
	                } catch (error) {
	                    alert('Error downloading file: ' + error.message);
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
