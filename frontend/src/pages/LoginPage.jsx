import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

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
      const res = await fetch('/api/v1/auth/login', {
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
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20 }}>
      <h2>FitZone Login</h2>
      {member ? (
        <div>
          <p>Welcome, <strong>{member.name}</strong> ({member.role})</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 10 }}>
            <label>Email:</label><br />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="heet@fitzone.com"
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <label>Password:</label><br />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="fitzone123"
              required
              minLength={8}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
          <p style={{ fontSize: 12, marginTop: 10 }}>
            Demo accounts are listed in the README.
          </p>
        </form>
      )}
    </div>
  )
}

export default LoginPage