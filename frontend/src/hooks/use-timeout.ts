import { useCallback, useEffect, useRef } from 'react';

function useTimeout() {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const _setTimeout = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (handler: (...args: any[]) => void, timeout?: number, ...args: any[]) => {
      timeoutId.current = setTimeout(handler, timeout, ...args);
    },
    [],
  );

  const _clearTimeout = useCallback(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
  }, []);

  useEffect(() => {
    return function cleanup() {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  return {
    setTimeout: _setTimeout,
    clearTimeout: _clearTimeout,
  };
}

export default useTimeout;
