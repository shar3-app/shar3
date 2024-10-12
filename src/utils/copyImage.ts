import { ErrorEvent, Theme } from '@shared';
import { invoke } from '@tauri-apps/api/core';
import { svgString2Image } from './base64';
import { trackError } from './trackError';

export const copyQrToClipboard = (id: string, theme: Theme): Promise<string> => {
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
              trackError(ErrorEvent.CopyQR, error);
              reject('generic.qr_copied.error');
            }
          },
          theme === 'dark' ? '#000' : '#fff'
        );
      } catch (error) {
        trackError(ErrorEvent.CopyQR, error);
        reject('generic.qr_copied.error'); // log event
      }
    } else {
      trackError(ErrorEvent.CopyQR, svg);
      reject('generic.qr_copied.error'); // log event
    }
  });
};
