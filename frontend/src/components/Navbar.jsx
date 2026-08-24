import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApiLog } from '../context/ApiLogContext';
import { IconDumbbell, IconLogout, IconTerminal } from './icons';
import { Button } from './ui';

/** Initials for the avatar circle, e.g. "Heet Mehta" -> "HM". */
function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase();
}

const Navbar = () => {
  const { member, logout } = useAuth();
  const { visible, toggle } = useApiLog();

  const linkClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`;

  return (
    <header className="topbar">
      <Link to={member ? '/classes' : '/login'} className="brand">
        <span className="brand-mark">
          <span style={{ color: '#fff', display: 'flex' }}>
            <IconDumbbell size={17} />
          </span>
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span className="brand-name">FitZone</span>
          <span className="brand-sub">Gym &amp; Class Booking</span>
        </span>
      </Link>

      <span className="sep" />

      <nav className="nav" aria-label="Main navigation">
        {member && (
          <>
            <NavLink to="/classes" className={linkClass}>Classes</NavLink>
            <NavLink to="/my-bookings" className={linkClass}>My Bookings</NavLink>
            {member.role === 'admin' && (
              <NavLink to="/admin" className={linkClass}>Admin Panel</NavLink>
            )}
          </>
        )}
      </nav>

      <div className="topbar-right">
        {/* Toggles the side-by-side API console */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggle}
          title={visible ? 'Hide API console' : 'Show API console'}
          aria-pressed={visible}
        >
          <IconTerminal />
          <span>{visible ? 'Hide console' : 'API console'}</span>
        </Button>

        {member ? (
          <>
            <div className="user-chip">
              <span className="avatar">{initials(member.name)}</span>
              <span className="user-meta">
                <span className="user-name">{member.name}</span>
                <span className="user-role">
                  {member.role} · {member.membershipType || 'basic'}
                </span>
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              <IconLogout />
              <span>Logout</span>
            </Button>
          </>
        ) : (
          <NavLink to="/login" className={linkClass}>Login</NavLink>
        )}
      </div>
    </header>
  );
};

export default Navbar;
