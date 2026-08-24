import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TrainerCard from '../components/TrainerCard'

// ClassesPage: fetches trainers from API, shows loading/error states,
// client-side search by specialization, and a booking form.
const ClassesPage = () => {
  const { member, token } = useAuth()

  // Task 4 states: trainers, loading, error
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Task 2: search + booking form state
  const [search, setSearch] = useState('')
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [className, setClassName] = useState('')
  const [date, setDate] = useState('')
  const [message, setMessage] = useState(null)

  // useEffect runs once when component mounts
  useEffect(() => {
    fetchTrainers()
  }, [])

  const fetchTrainers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/trainers')
      const data = await res.json()
      if (res.ok) {
        setTrainers(data.trainers)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch trainers')
      }
    } catch {
      setError('Cannot reach server. Is the backend running on port 5000?')
    } finally {
      setLoading(false)
    }
  }

  // Client-side filter: derived at render time, NO new API call
  const filteredTrainers = trainers.filter((t) =>
    t.specialization.toLowerCase().includes(search.toLowerCase())
  )

  // POST /api/v1/bookings with Bearer token
  const handleBook = async (e) => {
    e.preventDefault()
    setMessage(null)
    try {
      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          memberId: member.id,
          trainerId: selectedTrainer._id,
          className,
          date,
          timeSlot: selectedTimeSlot,
        }),
      })
      const data = await res.json()
      if (res.status === 201) {
        setMessage({ ok: true, text: `Booked ${className} with ${selectedTrainer.name}!` })
        setClassName('')
        setDate('')
        setSelectedTimeSlot('')
      } else {
        setMessage({ ok: false, text: data.message || 'Booking failed' })
      }
    } catch {
      setMessage({ ok: false, text: 'Network error while booking' })
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>FitZone — Available Classes</h2>

      {/* Search input filters the ALREADY-fetched array */}
      <input
        type="text"
        placeholder="Search by specialization (e.g. Yoga)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 320, padding: 8, marginBottom: 16 }}
      />

      {/* Loading state */}
      {loading && <p>Loading trainers...</p>}

      {/* Error state */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Success: render TrainerCards from API data (not hardcoded) */}
      {!loading && !error && (
        <>
          {filteredTrainers.length === 0 ? (
            <p>No trainers match "{search}"</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {filteredTrainers.map((trainer) => (
                <TrainerCard
                  key={trainer._id}
                  name={trainer.name}
                  specialization={trainer.specialization}
                  available={trainer.available}
                  onSelect={() => setSelectedTrainer(trainer)}
                  selected={selectedTrainer?._id === trainer._id}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Booking form (Task 2): two meaningful states shown live below */}
      {member && !loading && (
        <div style={{ marginTop: 24, maxWidth: 420 }}>
          <h3>Book a Class</h3>
          <p>
            Selected trainer:{' '}
            <strong>{selectedTrainer ? `${selectedTrainer.name} (${selectedTrainer.specialization})` : 'none yet — click a card above'}</strong>
          </p>
          <form onSubmit={handleBook}>
            <input
              type="text"
              placeholder="Class name (e.g. Morning Yoga)"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />
            <select
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            >
              <option value="">Select time slot</option>
              <option value="06:00-07:00">06:00-07:00</option>
              <option value="08:00-09:00">08:00-09:00</option>
              <option value="10:00-11:00">10:00-11:00</option>
              <option value="17:00-18:00">17:00-18:00</option>
              <option value="19:00-20:00">19:00-20:00</option>
            </select>
            <button type="submit" disabled={!selectedTrainer}>Book Class</button>
          </form>
          {message && (
            <p style={{ color: message.ok ? 'green' : 'red' }}>{message.text}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default ClassesPage