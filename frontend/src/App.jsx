import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ApiLogProvider, useApiLog } from './context/ApiLogContext'
import ApiLogPanel from './components/ApiLogPanel'
import LoginPage from './pages/LoginPage'
import ClassesPage from './pages/ClassesPage'
import MyBookingsPage from './pages/MyBookingsPage'

// Lazy loading: AdminPanel code is only fetched when /admin is first visited
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

const navLinkClass = ({ isActive }) =>
  `nav__link${isActive ? ' nav__link--active' : ''}`

// Inline SVG keeps the bundle free of an icon dependency
const DumbbellIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.5 6.5v11M3 9v5M17.5 6.5v11M21 9v5M6.5 12h11" />
  </svg>
)

const TerminalIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 17l6-5-6-5M12 19h8" />
  </svg>
)

// Navigation uses <Link>/<NavLink> (client-side routing, NO full page reload)
const Navigation = () => {
  const { member, logout } = useAuth()
  const { visible, toggle } = useApiLog()

  const initials = member
    ? member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <nav className="nav">
      <Link to="/" className="nav__brand">
        <span className="nav__mark"><DumbbellIcon /></span>
        Fit<span>Zone</span>
      </Link>

      {member && (
        <div className="nav__links">
          <NavLink to="/classes" className={navLinkClass}>Classes</NavLink>
          <NavLink to="/my-bookings" className={navLinkClass}>My Bookings</NavLink>
          {member.role === 'admin' && (
            <NavLink to="/admin" className={navLinkClass}>Admin Panel</NavLink>
          )}
        </div>
      )}

      <div className="nav__spacer" />

      <div className="nav__user">
        {/* Toggles the side-by-side API console */}
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={toggle}
          aria-pressed={visible}
          title={visible ? 'Hide API console' : 'Show API console'}
        >
          <TerminalIcon />
          {visible ? 'Hide console' : 'API console'}
        </button>

        {member && (
          <>
            <div className="user-chip">
              <span className="avatar" title={member.email}>{initials}</span>
              <span className="user-meta">
                <span className="user-name">{member.name}</span>
                <span className="user-role">
                  {member.role} · {member.membershipType || 'basic'}
                </span>
              </span>
            </div>
            <button className="btn btn--ghost btn--sm" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

// ProtectedRoute wrapper: redirects unauthenticated users to /
const ProtectedRoute = ({ children }) => {
  const { member } = useAuth()
  if (!member) return <Navigate to="/" replace />
  return children
}

// AdminRoute: requires login AND admin role
const AdminRoute = ({ children }) => {
  const { member } = useAuth()
  if (!member) return <Navigate to="/" replace />
  if (member.role !== 'admin') return <Navigate to="/classes" replace />
  return children
}

// Content + console laid out side by side; console can be collapsed
const Shell = () => {
  const { visible } = useApiLog()

  return (
    <div className={`shell${visible ? '' : ' shell--solo'}`}>
      <main>
        {/* Suspense shows fallback while the lazy chunk downloads */}
        <Suspense
          fallback={
            <div className="page">
              <div className="loading">
                <span className="spinner" />Loading Admin Panel…
              </div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {visible && <ApiLogPanel />}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ApiLogProvider>
        <AuthProvider>
          <Navigation />
          <Shell />
        </AuthProvider>
      </ApiLogProvider>
    </BrowserRouter>
  )
}

export default App
