import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// MyBookingsPage: protected page showing logged-in member's bookings.
// API returns populated memberId + trainerId (name, email, specialization).
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
    <div style={{ padding: 20 }}>
      <h2>My Bookings — {member ? member.name : ''}</h2>

      {loading && <p>Loading your bookings...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p>No bookings yet. Go to Classes and book one!</p>
      )}

      <table cellPadding={8} style={{ borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
            <th>Class</th><th>Trainer</th><th>Date</th><th>Time Slot</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id} style={{ borderBottom: '1px solid #ddd' }}>
              <td>{b.className}</td>
              {/* populated trainerId gives name + specialization */}
              <td>{b.trainerId ? `${b.trainerId.name} (${b.trainerId.specialization})` : 'N/A'}</td>
              <td>{new Date(b.date).toLocaleDateString()}</td>
              <td>{b.timeSlot}</td>
              <td>{b.status}</td>
              <td>
                {b.status === 'booked' && (
                  <button onClick={() => cancelBooking(b._id)}>Cancel</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MyBookingsPage