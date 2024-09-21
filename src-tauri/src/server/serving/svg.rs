use std::io::Error;
use std::path::Path;

use crate::server::utils::{file_to_base64, read_file_content};

pub fn svg_html(path_str: &str) -> Result<String, Error> {
    let path = Path::new(path_str);
    let name;
    let svg;
    let base64;

    match file_to_base64(path_str) {
        Ok(base64_string) => base64 = base64_string,
        Err(_) => base64 = String::from(path_str),
    }

    match read_file_content(path_str) {
        Ok(content) => svg = content,
        Err(_) => svg = String::from("<p>Error rendering svg file</p>"),
    }

    if let Some(filename) = path.file_name().and_then(|os_str| os_str.to_str()) {
        name = filename;
    } else {
        name = "filename";
    }

    let image_src = &format!("data:image/svg;base64,{}", base64.as_str());

    let mut html = String::from("
        <html>
        <head>
            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\" />
            <title>Image preview</title>
            <style>
                body { background-color: #111111; margin: 0; }
                #imgContent { width: 100vw; height: 100vh; display: inline-block; }
                #imgControls { background-color: white; position: absolute; width: 325px; top: 1rem; left: 50%; transform: translateX(-50%); z-index: 100; display: flex; padding: .5rem .65rem; gap: .5rem; border-radius: .35rem; box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px; }
                #imgControls button { transition: color 150ms; background-color: transparent; margin-top: .15rem; color: #222222; border: none; cursor: pointer; }
                #imgControls button:hover { color: #0d0d0d; }
                #imgFrame { height: 100%; width: 100%; }
                #imgFrame > div { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); height: auto; width: 50%; overflow: visible; }
                #svg { width: 100%; transform-origin: 50% 50%; box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px; }
                #download { background-color: #7f5af0; transition: background 150ms; border-radius: .35rem; cursor: pointer; margin-right: .5rem; padding: .75rem; display: flex; justify-content: center; align-items: center; font-size: .75rem; font-weight: bold; color: white; font-family: sans-serif; text-decoration: none; }
                #download:hover { background: #6546c3; }
            </style>
        </head>
        <body>
            <div id=\"imgControls\">
                <a id=\"download\" href=\"");
    html.push_str(image_src);
    html.push_str("\" download=\"");
    html.push_str(name);
    html.push_str("\">DOWNLOAD IMAGE</a>
                <button id=\"rotRightButton\"><svg style=\"transform:scaleX(-1)\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5\"/></svg></button>
                <button id=\"rotLeftButton\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M19.95 11a8 8 0 1 0 -.5 4m.5 5v-5h-5\"/></svg></button>
                <button id=\"zoomInButton\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/><path d=\"M7 10l6 0\"/><path d=\"M10 7l0 6\"/><path d=\"M21 21l-6 -6\"/></svg></button>
                <button id=\"zoomOutButton\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke=\"none\" d=\"M0 0h24v24H0z\" fill=\"none\"/><path d=\"M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\"/><path d=\"M7 10l6 0\"/><path d=\"M21 21l-6 -6\"/></svg></button>
            </div>
            <div id=\"imgContent\">
                <div id=\"imgFrame\">
                	<div><div id=\"svg\">");
    html.push_str(&svg);
    html.push_str("</div></div>
                </div>
            </div>

            <script type=\"module\">
	            var img = document.getElementById('svg'),
	                imgFrame = document.getElementById('imgFrame'),
	                buttons = ['zoomInButton', 'zoomOutButton', 'rotLeftButton', 'rotRightButton'];

	            buttons.forEach(id => document.getElementById(id).addEventListener('click', e => {
	                var btn = e.currentTarget.id, transformVals = img.style['transform'].match(/([-+]?[\\d\\.]+)/g),
	                    zoomVal = transformVals ? +transformVals[0] : 1, adjustVal = 0.1, imgClass = img.className;

	                if (btn.includes('zoom')) {
	                    zoomVal = btn === 'zoomInButton' ? Math.min(zoomVal + adjustVal, 2) : Math.max(zoomVal - adjustVal, 0.5);
	                    if (zoomVal === 2 || zoomVal === 0.5) return;

	                    img.style.transform = `scale(${zoomVal}) rotate(${getRotation(imgClass)}deg)`;
	                    zoomVal > 1 ? adjustFrame() : imgFrame.style.overflow = 'hidden';
	                } else rotate(btn);
	            }));

	            function adjustFrame() {
	                imgFrame.style.overflow = 'hidden';
	                setTimeout(() => imgFrame.style.overflow = 'auto', 0);
	            }

	            function rotate(btn) {
	                var imgClass = img.className, zoomVal = img.style['transform'].match(/([-+]?[\\d\\.]+)/g) ? +img.style['transform'].match(/([-+]?[\\d\\.]+)/g)[0] : 1,
	                    nextClass = { '': 'ninety', 'ninety': 'one-eighty', 'one-eighty': 'two-seventy', 'two-seventy': '' };

	                img.style.transform = `scale(${zoomVal}) rotate(${btn === 'rotRightButton' ? getNextRotation(imgClass, 1) : getNextRotation(imgClass, -1)}deg)`;
	                img.className = nextClass[imgClass];
	                adjustFrame();
	            }

	            function getRotation(c) {
	                return { '': 0, 'ninety': 90, 'one-eighty': 180, 'two-seventy': 270 }[c];
	            }

	            function getNextRotation(c, dir) {
	                var rotations = ['', 'ninety', 'one-eighty', 'two-seventy'];
	                return getRotation(rotations[(rotations.indexOf(c) + dir + 4) % 4]);
	            }
            </script>
        </body>
        </html>
    ");

    Ok(html)
}
