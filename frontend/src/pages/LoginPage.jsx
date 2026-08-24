import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/apiBase'

// LoginPage: email + password login that calls POST /api/v1/auth/login
const LoginPage = () => {
  const { login, logout, member } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        // store member object + real JWT in context
        login(data.member, data.token)
        navigate(data.member.role === 'admin' ? '/admin' : '/classes')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Cannot reach server. Is the backend running on port 5000?')
    }
  }

  return (
    <div className="page">
      <div className="card form-card">
        <h2>Welcome back</h2>
        <p style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>
          Sign in to book trainer-led classes.
        </p>

        {member ? (
          <div className="stack">
            <div className="alert alert--success">
              Logged in as <strong>{member.name}</strong> ({member.role})
            </div>
            <button className="btn btn--ghost btn--block" onClick={logout}>Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@fitzone.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <button type="submit" className="btn btn--primary btn--block">Sign In</button>
            <p className="hint">
              Demo accounts are listed in the project README.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default LoginPage