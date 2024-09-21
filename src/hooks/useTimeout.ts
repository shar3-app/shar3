import { useRef } from 'react';

const useTimeout = (callback: () => void, ms: number) => {
  const timeoutRef = useRef<number | null>(null);

  const timeout = () => {
    // Set the timeout and store the ID in the ref
    timeoutRef.current = setTimeout(callback, ms);
  };

  const killTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // Cancel the timeout
      timeoutRef.current = null; // Clean up the reference
    }
  };

  return { timeout, killTimeout };
};

export default useTimeout;
