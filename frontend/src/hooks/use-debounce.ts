import { useEffect } from 'react';
import useTimeout from './use-timeout';

function useDebounce(cb: () => void, deps: unknown[], delay: number) {
  const { clearTimeout, setTimeout } = useTimeout();

  useEffect(() => {
    setTimeout(cb, delay);

    return () => {
      clearTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default useDebounce;
