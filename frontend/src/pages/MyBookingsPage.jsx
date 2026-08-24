import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// MyBookingsPage: protected page showing logged-in member's bookings.
// API returns populated memberId + trainerId (name, email, specialization).
const STATUS_PILL = { booked: 'pill--booked', attended: 'pill--attended', cancelled: 'pill--cancelled' }

const MyBookingsPage = () => {
  const { member, token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMyBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMyBookings = async () => {
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
        setError(data.message || 'Failed to fetch bookings')
      }
    } catch {
      setError('Cannot reach server. Is the backend running on port 5000?')
    } finally {
      setLoading(false)
    }
  }

  // Cancel a booking via PATCH /api/v1/bookings/:id/status
  const cancelBooking = async (id) => {
    try {
      const res = await fetch(`/api/v1/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (res.ok) fetchMyBookings() // refresh list
    } catch {
      setError('Network error while updating booking')
    }
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>My Bookings</h2>
          <p>{member ? `Signed in as ${member.name} (${member.email})` : ''}</p>
        </div>
      </div>

      <div className="card stack">
        {loading && <div className="loading"><span className="spinner" />Loading your bookings...</div>}
        {error && <div className="alert alert--error">{error}</div>}

        {!loading && !error && bookings.length === 0 && (
          <div className="alert alert--muted">No bookings yet. Head to Classes and book your first session!</div>
        )}

        {!loading && bookings.length > 0 && (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th><th>Trainer</th><th>Date</th><th>Time Slot</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td><strong>{b.className}</strong></td>
                    {/* populated trainerId gives name + specialization */}
                    <td>{b.trainerId ? `${b.trainerId.name} · ${b.trainerId.specialization}` : 'N/A'}</td>
                    <td>{new Date(b.date).toLocaleDateString('en-GB')}</td>
                    <td>{b.timeSlot}</td>
                    <td><span className={`pill ${STATUS_PILL[b.status] || 'pill--basic'}`}>{b.status}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      {b.status === 'booked' && (
                        <button className="btn btn--danger btn--sm" onClick={() => cancelBooking(b._id)}>
                          Cancel
                        </button>
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

export default MyBookingsPage