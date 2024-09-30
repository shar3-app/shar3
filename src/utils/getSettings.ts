import { ErrorEvent, Settings } from '@shared';
import { trackError } from './trackError';

export const getSettings = (): Settings | null => {
  try {
    const saved = localStorage.getItem('settings');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    trackError(ErrorEvent.GetSettings, error);
    return null;
  }
};
