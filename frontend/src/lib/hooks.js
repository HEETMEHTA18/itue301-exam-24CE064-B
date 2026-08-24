import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useToasts — transient success/error messages that auto-dismiss.
 * Timers are tracked so unmounting never fires setState on a dead component.
 */
export function useToasts(ttl = 3800) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef([]);
  const seq = useRef(0);

  const push = useCallback(
    (text, tone = 'ok') => {
      const id = ++seq.current;
      setToasts((prev) => [...prev, { id, text, tone }]);
      const t = setTimeout(
        () => setToasts((prev) => prev.filter((x) => x.id !== id)),
        ttl
      );
      timers.current.push(t);
    },
    [ttl]
  );

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  return { toasts, push };
}

/**
 * useOnMount — runs an effect exactly once, even under React StrictMode's
 * intentional double-invocation in development. Keeps the API log panel free
 * of duplicate entries for what is conceptually a single page load.
 */
export function useOnMount(effect) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
