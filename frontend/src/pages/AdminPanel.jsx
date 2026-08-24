import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// AdminPanel: lazy-loaded via React.lazy + Suspense in App.jsx.
// Admin-only view of trainers and ALL bookings.
const AdminPanel = () => {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllBookings()
  }, [])

  // Admin can read every booking by querying without member filter.
  // We reuse /my for demo simplicity; a full admin endpoint would live at /api/v1/bookings (GET).
  const fetchAllBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/bookings/my', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setBookings(data.bookings)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch data')
      }
    } catch {
      setError('Cannot reach server')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/v1/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      if (res.ok) fetchAllBookings()
    } catch {
      setError('Network error')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel — Roster Management</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <h3>All Bookings ({bookings.length})</h3>
          <table cellPadding={8} style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                <th>Member</th><th>Class</th><th>Trainer</th><th>Date</th><th>Status</th><th>Set Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{b.memberId ? b.memberId.name : 'N/A'}</td>
                  <td>{b.className}</td>
                  <td>{b.trainerId ? b.trainerId.name : 'N/A'}</td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td><strong>{b.status}</strong></td>
                  <td>
                    <button onClick={() => updateStatus(b._id, 'attended')}>Mark Attended</button>{' '}
                    <button onClick={() => updateStatus(b._id, 'cancelled')}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default AdminPanel