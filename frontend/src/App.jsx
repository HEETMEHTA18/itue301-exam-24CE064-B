import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import ClassesPage from './pages/ClassesPage'
import MyBookingsPage from './pages/MyBookingsPage'

// Lazy loading: AdminPanel code is only fetched when /admin is first visited
const AdminPanel = lazy(() => import('./pages/AdminPanel'))

// Navigation uses <Link> (client-side routing, NO full page reload)
const Navigation = () => {
  const { member, logout } = useAuth()
  return (
    <nav style={{ padding: '10px 20px', background: '#222', display: 'flex', gap: 20, alignItems: 'center' }}>
      <strong style={{ color: '#fff' }}>FitZone</strong>
      {member ? (
        <>
          <Link to="/classes" style={{ color: '#9cf' }}>Classes</Link>
          <Link to="/my-bookings" style={{ color: '#9cf' }}>My Bookings</Link>
          {member.role === 'admin' && (
            <Link to="/admin" style={{ color: '#fc6' }}>Admin Panel</Link>
          )}
          <span style={{ color: '#aaa', marginLeft: 'auto' }}>{member.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/" style={{ color: '#9cf' }}>Login</Link>
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
        <Suspense fallback={<p style={{ padding: 20 }}>Loading Admin Panel...</p>}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/classes" element={
              <ProtectedRoute><ClassesPage /></ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute><AdminPanel /></AdminRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App