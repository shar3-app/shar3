import { ErrorEvent, LocalStorage } from '@shared';
import { trackError } from '@utils';
import { useEffect, useState } from 'react';

export default <T = any>(key: LocalStorage, defaultValue: T) => {
  const getValue = (): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
      return defaultValue;
    } catch (error) {
      trackError(ErrorEvent.LocalStorage, error);
      return defaultValue;
    }
  };

  const [value, setValue] = useState<T>(getValue());

  useEffect(() => {
    const rawValue = JSON.stringify(value);
    localStorage.setItem(key, rawValue);
  }, [key, value]);

  return { value, setValue, getValue };
};
