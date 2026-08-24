import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  onApiLog,
  installFetchLogger,
  getBuffer,
  clearBuffer,
} from '../lib/apiLog'

// Patch fetch at module scope so requests fired during the very first render
// are captured too.
installFetchLogger()

const MAX_ENTRIES = 60
const ApiLogContext = createContext(null)

export const ApiLogProvider = ({ children }) => {
  // Newest first — reads like a terminal.
  const [entries, setEntries] = useState(() =>
    getBuffer().slice(-MAX_ENTRIES).reverse()
  )
  const [visible, setVisible] = useState(true)

  useEffect(
    () =>
      onApiLog((entry) =>
        setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES))
      ),
    []
  )

  const clear = useCallback(() => {
    clearBuffer()
    setEntries([])
  }, [])

  const toggle = useCallback(() => setVisible((v) => !v), [])

  return (
    <ApiLogContext.Provider value={{ entries, clear, visible, toggle }}>
      {children}
    </ApiLogContext.Provider>
  )
}

export const useApiLog = () => {
  const ctx = useContext(ApiLogContext)
  if (!ctx) throw new Error('useApiLog must be used inside an ApiLogProvider')
  return ctx
}
