import { useCallback, useRef, useState } from "react";

export function useUpdateTimer(): readonly [number | null, (action: () => void) => void] {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const latest = useRef(0);

  const timed = useCallback((action: () => void) => {
    latest.current += 1;
    const id = latest.current;
    const start = performance.now();
    action();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Ignore the result if a newer interaction has started since.
        if (latest.current === id) setElapsed(performance.now() - start);
      });
    });
  }, []);

  return [elapsed, timed] as const;
}