// apiLog.js — a tiny observability layer for the REST API.
//
// Instead of forcing every page to import a custom fetch wrapper, we patch
// window.fetch ONCE and emit a log entry for anything hitting /api/. Pages keep
// using plain fetch() and still show up in the console panel.

const listeners = new Set()
const buffer = []
const MAX_BUFFER = 80

let seq = 0
let installed = false

/** Subscribe to log entries. Returns an unsubscribe function. */
export function onApiLog(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Entries captured before React mounted (e.g. during an early fetch). */
export function getBuffer() {
  return buffer.slice()
}

export function clearBuffer() {
  buffer.length = 0
}

function emit(entry) {
  buffer.push(entry)
  if (buffer.length > MAX_BUFFER) buffer.shift()
  // A throwing listener must never break the app's fetch call.
  listeners.forEach((fn) => {
    try {
      fn(entry)
    } catch {
      /* ignore listener errors */
    }
  })
}

/** Pull a human-readable message out of a failed response, without
 *  consuming the body the caller still needs — hence res.clone(). */
async function readError(res) {
  try {
    const text = await res.clone().text()
    if (!text) return ''
    try {
      return JSON.parse(text).message || text.slice(0, 140)
    } catch {
      return text.slice(0, 140)
    }
  } catch {
    return ''
  }
}

/** Wrap window.fetch. Idempotent — safe under StrictMode double-invoke. */
export function installFetchLogger() {
  if (installed || typeof window === 'undefined') return
  installed = true

  const original = window.fetch.bind(window)

  window.fetch = async (input, init = {}) => {
    const url =
      typeof input === 'string' ? input : input?.url ?? String(input)
    const method = (
      init.method || (typeof input !== 'string' && input?.method) || 'GET'
    ).toUpperCase()

    // Only instrument our own API; let Vite HMR and assets pass through.
    if (!url.includes('/api/')) return original(input, init)

    const id = ++seq
    const started = performance.now()

    try {
      const res = await original(input, init)
      emit({
        id,
        method,
        path: url,
        status: res.status,
        ok: res.ok,
        durationMs: performance.now() - started,
        at: Date.now(),
        message: res.ok ? '' : await readError(res),
      })
      return res
    } catch (err) {
      // status 0 = never reached the server (backend down, CORS, DNS).
      emit({
        id,
        method,
        path: url,
        status: 0,
        ok: false,
        durationMs: performance.now() - started,
        at: Date.now(),
        message: err?.message || 'Network error',
      })
      throw err
    }
  }
}
