import { useEffect, useRef, useState } from 'react';

const useDebounce = <T = any>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState<T | undefined>();
  const timerRef = useRef<number>();

  useEffect(() => {
    timerRef.current = setTimeout(() => setDebouncedValue(value), delay);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
