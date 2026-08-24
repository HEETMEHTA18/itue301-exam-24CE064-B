import { IconAlert, IconCheck, IconInbox } from './icons';

/* ------------------------------------------------------------- Badge --- */
export const Badge = ({ tone = 'neutral', children, withDot = false }) => (
  <span className={`badge badge-${tone}`}>
    {withDot && <span className="dot" />}
    {children}
  </span>
);

/** Maps a booking status to a badge tone. */
export const StatusBadge = ({ status }) => {
  const tones = { booked: 'info', attended: 'ok', cancelled: 'danger' };
  return (
    <Badge tone={tones[status] || 'neutral'} withDot>
      {status}
    </Badge>
  );
};

/* ------------------------------------------------------------ Button --- */
export const Button = ({
  variant = 'primary',
  size,
  block = false,
  loading = false,
  children,
  ...rest
}) => {
  const classes = ['btn'];
  if (variant !== 'primary') classes.push(`btn-${variant}`);
  if (size === 'sm') classes.push('btn-sm');
  if (block) classes.push('btn-block');

  return (
    <button className={classes.join(' ')} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className={`spinner${variant !== 'primary' ? ' spinner-dark' : ''}`} />}
      {children}
    </button>
  );
};

/* ------------------------------------------------------------- Alert --- */
export const Alert = ({ tone = 'danger', title, children }) => (
  <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
    <span style={{ flexShrink: 0, marginTop: 1 }}>
      {tone === 'ok' ? <IconCheck size={15} /> : <IconAlert />}
    </span>
    <span>
      {title && <div className="alert-title">{title}</div>}
      {children && <div className={title ? 'alert-body' : undefined}>{children}</div>}
    </span>
  </div>
);

/* -------------------------------------------------------- EmptyState --- */
export const EmptyState = ({ icon, title, children }) => (
  <div className="empty">
    <div className="empty-icon">{icon || <IconInbox />}</div>
    <div className="empty-title">{title}</div>
    {children && <p className="empty-text">{children}</p>}
  </div>
);

/* ---------------------------------------------------------- Skeletons --- */
export const SkeletonGrid = ({ count = 6 }) => (
  <div className="trainer-grid" aria-busy="true" aria-label="Loading trainers">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton sk-card" />
    ))}
  </div>
);

export const SkeletonRows = ({ count = 4 }) => (
  <div style={{ padding: 16 }} aria-busy="true" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="skeleton sk-row" />
    ))}
  </div>
);

/* --------------------------------------------------------------- Stat --- */
export const Stat = ({ label, value, hint }) => (
  <div className="stat">
    <div className="stat-label">{label}</div>
    <div className="stat-value tnum">{value}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </div>
);

/* -------------------------------------------------------- ToastStack --- */
export const ToastStack = ({ toasts }) => {
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`} role="status">
          <span className="toast-bar" />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
};
