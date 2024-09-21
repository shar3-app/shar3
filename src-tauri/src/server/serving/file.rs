use std::io::Error;
use std::path::Path;
use tracing::error;

use crate::server::utils::{file_to_base64, get_filename};

pub fn file_html(path_str: &str) -> Result<String, Error> {
    error!("{}", path_str);
    let path = Path::new(path_str);
    let name = get_filename(path);
    let base64;

    match file_to_base64(path_str) {
        Ok(base64_string) => base64 = base64_string,
        Err(err) => {
            error!("{}", err.to_string());
            base64 = String::from(path_str);
        }
    }

    let mut html = String::from("
        <html>
        <head>
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />
            <title>");
    html.push_str(&name);
    html.push_str("</title>
            <style>
                body { background-color: #111111; margin: 0; }
                #imgContent { width: 100vw; height: 100vh; display: inline-block; }
                #imgControls { background-color: white; position: absolute; width: 325px; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; padding: .5rem .65rem; gap: .5rem; border-radius: .35rem; box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px; }
                #imgControls button { transition: color 150ms; background-color: transparent; margin-top: .15rem; color: #222222; border: none; cursor: pointer; }
                #imgControls button:hover { color: #0d0d0d; }
                #imgFrame { height: 100%; width: 100%; }
                #imgFrame > div { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); height: auto; width: 50%; overflow: visible; }
                #invoiceImg { width: 100%; transform-origin: 50% 50%; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; }
                #download { background-color: #7f5af0; transition: background 150ms; border-radius: .35rem; cursor: pointer; margin-right: .5rem; padding: .75rem; display: flex; justify-content: center; align-items: center; font-size: .75rem; font-weight: bold; color: white; font-family: sans-serif; text-decoration: none; }
                #download:hover { background: #6546c3; }
            </style>
        </head>
        <body>
        <button id=\"download\">Download file</button>

            <script>
                async function download() {
                    // Convert the Base64-encoded file to a Blob
                    const fileData = atob(\"");
    html.push_str(&base64);
    html.push_str(
        "\");
                    const byteArray = new Uint8Array(fileData.length);
                    for (let i = 0; i < fileData.length; i++) {
                        byteArray[i] = fileData.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray], { type: 'application/octet-stream' });

                    // Create a link element and trigger a download
                    const link = document.createElement('a');
                    link.style.display = 'none';
                    link.href = window.URL.createObjectURL(blob);
                    link.download = '",
    );
    html.push_str(&name);
    html.push_str(
        "';
                    link.click();
                }

                document.getElementById('download').addEventListener('click', async () => await download())
            </script>
        </body>
        </html>
    ",
    );

    Ok(html)
}
