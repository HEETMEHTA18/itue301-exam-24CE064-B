import { useApiLog } from '../context/ApiLogContext'

/** 200 -> s-2xx, 404 -> s-4xx, 0 (never reached server) -> s-err */
function statusClass(status) {
  if (!status) return 's-err'
  return `s-${Math.floor(status / 100)}xx`
}

/** Show "/api/v1/trainers" instead of the whole absolute URL. */
function shortPath(path) {
  try {
    const u = new URL(path, window.location.origin)
    return u.pathname + u.search
  } catch {
    return path
  }
}

function formatMs(ms) {
  if (ms < 1) return '<1ms'
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

function clockTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour12: false })
}

/**
 * ApiLogPanel — live console of every /api/ request the app makes.
 * Sits side-by-side with page content so the REST layer is visible while
 * using the app (and screenshots cleanly for the report).
 */
const ApiLogPanel = () => {
  const { entries, clear } = useApiLog()

  const okCount = entries.filter((e) => e.ok).length
  const failCount = entries.length - okCount
  const avgMs = entries.length
    ? entries.reduce((sum, e) => sum + e.durationMs, 0) / entries.length
    : 0

  return (
    <aside className="log-panel" aria-label="API activity console">
      <div className="log-head">
        <span className="log-live" aria-hidden="true" />
        <span className="log-title">API Activity</span>
        <span className="log-count">{entries.length}</span>
        <button
          type="button"
          className="log-clear"
          onClick={clear}
          disabled={!entries.length}
          title="Clear log"
        >
          Clear
        </button>
      </div>

      <div className="log-list">
        {entries.length === 0 ? (
          <p className="log-empty">
            Waiting for requests…
            <br />
            <span>
              Every call to the Express API appears here with its status code
              and response time.
            </span>
          </p>
        ) : (
          entries.map((e) => (
            <div className={`log-row${e.ok ? '' : ' log-row--bad'}`} key={e.id}>
              <span className="log-line">
                <span className={`log-method m-${e.method}`}>{e.method}</span>
                <span className="log-path" title={e.path}>
                  {shortPath(e.path)}
                </span>
                <span className={`log-status ${statusClass(e.status)}`}>
                  {e.status || 'ERR'}
                </span>
              </span>
              <span className="log-meta">
                <span>{clockTime(e.at)}</span>
                <span className="log-ms">{formatMs(e.durationMs)}</span>
              </span>
              {!e.ok && e.message && (
                <span className="log-msg" title={e.message}>
                  ↳ {e.message}
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="log-foot">
        <span>
          <strong className="ok">{okCount}</strong> ok ·{' '}
          <strong className={failCount ? 'bad' : ''}>{failCount}</strong> failed
        </span>
        <span>{entries.length ? `avg ${formatMs(avgMs)}` : 'idle'}</span>
      </div>
    </aside>
  )
}

export default ApiLogPanel
