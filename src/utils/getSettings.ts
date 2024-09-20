import { Settings } from '@shared';

export const getSettings = (): Settings | null => {
  try {
    const saved = localStorage.getItem('settings');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return null;
  } catch {
    return null;
  }
};
