import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import ClassesPage from './pages/ClassesPage'
import MyBookingsPage from './pages/MyBookingsPage'

// Lazy loading: AdminPanel code is only fetched when /admin is first visited
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// Navigation uses <Link>/<NavLink> (client-side routing, NO full page reload)
const Navigation = () => {
  const { member, logout } = useAuth()
  const initials = member
    ? member.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <nav className="nav">
      <Link to="/" className="nav__brand">Fit<span>Zone</span></Link>
      {member ? (
        <>
          <div className="nav__links">
            <NavLink to="/classes" className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>Classes</NavLink>
            <NavLink to="/my-bookings" className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>My Bookings</NavLink>
            {member.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => `nav__link${isActive ? ' nav__link--active' : ''}`}>Admin Panel</NavLink>
            )}
          </div>
          <div className="nav__spacer" />
          <div className="nav__user">
            <span>{member.name}</span>
            <span className="avatar" title={member.email}>{initials}</span>
            <button className="btn btn--ghost btn--sm" style={{ color: '#fff', borderColor: '#33415a' }} onClick={logout}>
              Logout
            </button>
          </div>
        </>
      ) : (
        <div className="nav__spacer" />
      )}
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navigation />
        {/* Suspense shows fallback while the lazy chunk downloads */}
        <Suspense fallback={
          <div className="page"><div className="loading"><span className="spinner" />Loading Admin Panel...</div></div>
        }>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/classes" element={<ProtectedRoute><ClassesPage /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App