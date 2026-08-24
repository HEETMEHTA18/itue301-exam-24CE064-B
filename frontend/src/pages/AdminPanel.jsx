import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../lib/apiBase'

// AdminPanel: lazy-loaded via React.lazy + Suspense in App.jsx.
// Admin-only view: roster stats + ALL bookings with status management.
const STATUS_PILL = { booked: 'pill--booked', attended: 'pill--attended', cancelled: 'pill--cancelled' }
const MEMBER_PILL = { basic: 'pill--basic', premium: 'pill--premium', platinum: 'pill--platinum' }

const AdminPanel = () => {
  const { token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAllBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Admin-only endpoint returns every member's bookings.
  const fetchAllBookings = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/bookings', {
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
      const res = await apiFetch(`/bookings/${id}/status`, {
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

  const activeCount = bookings.filter((b) => b.status === 'booked').length
  const attendedCount = bookings.filter((b) => b.status === 'attended').length
  const membersCount = new Set(bookings.map((b) => b.memberId?._id)).size

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Admin Panel</h2>
          <p>Manage the full class roster and booking statuses.</p>
        </div>
      </div>

      {/* quick stats derived from the fetched list */}
      <div className="stats">
        <div className="stat"><div className="stat__num">{bookings.length}</div><div className="stat__label">Total bookings</div></div>
        <div className="stat"><div className="stat__num">{activeCount}</div><div className="stat__label">Active (booked)</div></div>
        <div className="stat"><div className="stat__num">{attendedCount}</div><div className="stat__label">Attended</div></div>
        <div className="stat"><div className="stat__num">{membersCount}</div><div className="stat__label">Unique members</div></div>
      </div>

      <div className="card stack">
        {loading && <div className="loading"><span className="spinner" />Loading roster...</div>}
        {error && <div className="alert alert--error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="alert alert--muted">No bookings in the system yet.</div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th><th>Membership</th><th>Class</th><th>Trainer</th><th>Date</th><th>Slot</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.memberId ? b.memberId.name : 'N/A'}</strong><br />
                      <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>{b.memberId?.email}</span>
                    </td>
                    <td>
                      <span className={`pill ${MEMBER_PILL[b.memberId?.membershipType] || 'pill--basic'}`}>
                        {b.memberId?.membershipType || '—'}
                      </span>
                    </td>
                    <td>{b.className}</td>
                    <td>{b.trainerId ? b.trainerId.name : 'N/A'}</td>
                    <td>{new Date(b.date).toLocaleDateString('en-GB')}</td>
                    <td>{b.timeSlot}</td>
                    <td><span className={`pill ${STATUS_PILL[b.status] || 'pill--basic'}`}>{b.status}</span></td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {b.status === 'booked' && (
                        <>
                          <button className="btn btn--ghost btn--sm" onClick={() => updateStatus(b._id, 'attended')}>
                            Attended
                          </button>{' '}
                          <button className="btn btn--danger btn--sm" onClick={() => updateStatus(b._id, 'cancelled')}>
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel