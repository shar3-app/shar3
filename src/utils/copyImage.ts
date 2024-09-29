import { ThemeMode } from '@shared';
import { invoke } from '@tauri-apps/api/core';
import { svgString2Image } from './base64';

export const copyQrToClipboard = (id: string, theme: () => ThemeMode): Promise<string> => {
  return new Promise((resolve, reject) => {
    const svg = document.getElementById(id);
    if (svg) {
      try {
        const svgString = new XMLSerializer().serializeToString(svg);
        svgString2Image(
          svgString,
          async (base64String) => {
            try {
              // Invoke the Tauri command to copy the image
              await invoke('copy_image_to_clipboard', { base64String });
              resolve('generic.qr_copied.success');
            } catch (error) {
              console.error(error); // TODO log
              reject('generic.qr_copied.error');
            }
          },
          theme() === 'dark' ? '#000' : '#fff'
        );
      } catch (err) {
        reject('generic.qr_copied.error'); // log event
      }
    } else {
      reject('generic.qr_copied.error'); // log event
    }
  });
};
