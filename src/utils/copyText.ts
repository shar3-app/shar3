import { ErrorEvent } from '@shared';
import { trackError } from './trackError';

export const copyURLToClipboard = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      navigator.clipboard
        .writeText(url)
        .then(() => resolve('generic.url_copied.success'))
        .catch((error) => {
          trackError(ErrorEvent.CopyUrl, error);
          reject('generic.url_copied.error');
        });
    } catch (error) {
      trackError(ErrorEvent.CopyUrl, error);
      reject('generic.url_copied.error');
    }
  });
};
