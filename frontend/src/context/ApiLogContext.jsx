import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onApiLog } from '../lib/api';

/**
 * ApiLogContext — collects the log records emitted by lib/api.js so the
 * console panel can render live request activity next to the UI.
 * Capped at MAX_ENTRIES so a long session cannot grow unbounded.
 */
const MAX_ENTRIES = 60;

const ApiLogContext = createContext(null);

export const ApiLogProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // onApiLog returns its own unsubscribe, so StrictMode's double-mount
    // cannot leave a duplicate listener behind.
    return onApiLog((record) => {
      setEntries((prev) => [record, ...prev].slice(0, MAX_ENTRIES));
    });
  }, []);

  const clear = useCallback(() => setEntries([]), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);

  return (
    <ApiLogContext.Provider value={{ entries, clear, visible, toggle }}>
      {children}
    </ApiLogContext.Provider>
  );
};

export const useApiLog = () => {
  const ctx = useContext(ApiLogContext);
  if (!ctx) throw new Error('useApiLog must be used inside <ApiLogProvider>');
  return ctx;
};
