/**
 * Inline SVG icons — no icon library dependency.
 * All icons inherit currentColor and default to 16px.
 */
const base = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
});

export const IconDumbbell = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11" />
  </svg>
);

export const IconSearch = ({ size = 15 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const IconCheck = ({ size = 11 }) => (
  <svg {...base(size)} strokeWidth={3}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export const IconCalendar = ({ size = 16 }) => (
  <svg {...base(size)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 11h18" />
  </svg>
);

export const IconClock = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconUser = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
  </svg>
);

export const IconLogout = ({ size = 15 }) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export const IconAlert = ({ size = 16 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4.5M12 16h.01" />
  </svg>
);

export const IconInbox = ({ size = 20 }) => (
  <svg {...base(size)}>
    <path d="M3 12h5l2 3h4l2-3h5" />
    <path d="M5 5h14l2 7v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
  </svg>
);

export const IconTerminal = ({ size = 14 }) => (
  <svg {...base(size)}>
    <path d="M5 8l3.5 4L5 16M12 16h7" />
  </svg>
);

export const IconShield = ({ size = 16 }) => (
  <svg {...base(size)}>
    <path d="M12 3l7.5 3v6c0 4.5-3.2 7.6-7.5 9-4.3-1.4-7.5-4.5-7.5-9V6z" />
    <path d="M9.2 12l2 2 3.6-3.8" />
  </svg>
);

export const IconChevron = ({ size = 14, dir = 'right' }) => {
  const rotate = { right: 0, down: 90, left: 180, up: 270 }[dir] ?? 0;
  return (
    <svg {...base(size)} style={{ transform: `rotate(${rotate}deg)` }}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
};

export const IconTrash = ({ size = 13 }) => (
  <svg {...base(size)}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);
