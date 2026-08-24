import { useApiLog } from '../context/ApiLogContext';
import { IconTrash } from './icons';

/** 2xx -> s-2xx, 404 -> s-4xx, 0 (network failure) -> s-err */
function statusClass(status) {
  if (!status) return 's-err';
  return `s-${Math.floor(status / 100)}xx`;
}

/** Strip the origin so rows show "/api/v1/trainers", not the full URL. */
function shortPath(path) {
  try {
    return new URL(path, window.location.origin).pathname;
  } catch {
    return path;
  }
}

function formatMs(ms) {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * ApiLogPanel — live console of every request made through lib/api.js.
 * Sits beside the page content so the REST layer is visible while using
 * the app (and shows up nicely in report screenshots).
 */
const ApiLogPanel = () => {
  const { entries, clear } = useApiLog();

  const okCount = entries.filter((e) => e.ok).length;
  const failCount = entries.length - okCount;
  const avgMs = entries.length
    ? entries.reduce((sum, e) => sum + e.durationMs, 0) / entries.length
    : 0;

  return (
    <aside className="log-panel" aria-label="API activity console">
      <div className="log-head">
        <span className="log-title">
          <span className="log-live" aria-hidden="true" />
          API Activity
        </span>
        <span className="log-count tnum">{entries.length}</span>
        <span className="grow" />
        <button
          className="btn btn-ghost btn-sm"
          onClick={clear}
          disabled={!entries.length}
          title="Clear log"
        >
          <IconTrash />
        </button>
      </div>

      <div className="log-list">
        {entries.length === 0 ? (
          <p className="log-empty">
            No requests yet.
            <br />
            Every API call appears here with its status and response time.
          </p>
        ) : (
          entries.map((e) => (
            <div className="log-row" key={e.id}>
              <span className={`log-method m-${e.method}`}>{e.method}</span>
              <span className="log-path" title={e.path}>{shortPath(e.path)}</span>
              <span className="log-right">
                <span className={`log-status tnum ${statusClass(e.status)}`}>
                  {e.status || 'ERR'}
                </span>
                <span className="log-ms tnum">{formatMs(e.durationMs)}</span>
              </span>
              {/* Server message on a second line when the call failed */}
              {!e.ok && e.message && (
                <span className="log-msg" title={e.message}>↳ {e.message}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="log-foot">
        <span className="tnum">
          {okCount} ok · {failCount} failed
        </span>
        <span className="tnum">
          {entries.length ? `avg ${formatMs(avgMs)}` : 'idle'}
        </span>
      </div>
    </aside>
  );
};

export default ApiLogPanel;
