import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import TrainerCard from '../components/TrainerCard'

// ClassesPage: fetches trainers from API, shows loading/error states,
// client-side search by specialization, and a booking form.
const TIME_SLOTS = ['06:00-07:00', '08:00-09:00', '10:00-11:00', '17:00-18:00', '19:00-20:00']

const ClassesPage = () => {
  const { member, token } = useAuth()

  // Task 4 states: trainers, loading, error
  const [trainers, setTrainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Task 2: search + booking form state (selected trainer & time slot shown live)
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
          trainerId: selectedTrainer._id,
          className,
          date,
          timeSlot: selectedTimeSlot,
        }),
      })
      const data = await res.json()
      if (res.status === 201) {
        setMessage({ ok: true, text: `Booked ${className} with ${selectedTrainer.name}, ${date} ${selectedTimeSlot}.` })
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
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Book a Class</h2>
          <p>Pick a trainer, choose your slot — no more WhatsApp double-bookings.</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="text"
          className="input search"
          placeholder="Search by specialization (e.g. Yoga)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {/* derived count proves filtering happens client-side */}
        <span style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>
          Showing {filteredTrainers.length} of {trainers.length} trainers
        </span>
      </div>

      {message && (
        <div className={`alert ${message.ok ? 'alert--success' : 'alert--error'}`}>{message.text}</div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading"><span className="spinner" />Loading trainers...</div>
      )}

      {/* Error state */}
      {error && <div className="alert alert--error">{error}</div>}

      {/* Success: render TrainerCards from API data (not hardcoded) */}
      {!loading && !error && (
        filteredTrainers.length === 0 ? (
          <div className="alert alert--muted">No trainers match "{search}".</div>
        ) : (
          <div className="grid-cards">
            {filteredTrainers.map((trainer) => (
              <TrainerCard
                key={trainer._id}
                name={trainer.name}
                specialization={trainer.specialization}
                available={trainer.available}
                onSelect={() =>
                  setSelectedTrainer((prev) => (prev?._id === trainer._id ? null : trainer))
                }
                selected={selectedTrainer?._id === trainer._id}
              />
            ))}
          </div>
        )
      )}

      {/* Booking form */}
      {member && !loading && (
        <div className="split">
          <div />
          <div className="card">
            <h3>Booking details</h3>
            <div className="selected-note">
              {selectedTrainer
                ? `Trainer: ${selectedTrainer.name} — ${selectedTrainer.specialization}`
                : 'Click a trainer card above to select.'}
            </div>
            <form onSubmit={handleBook}>
              <div className="field">
                <label htmlFor="className">Class name</label>
                <input
                  id="className" type="text" className="input"
                  placeholder="e.g. Morning Yoga Flow"
                  value={className} onChange={(e) => setClassName(e.target.value)} required
                />
              </div>
              <div className="field">
                <label htmlFor="date">Date</label>
                <input
                  id="date" type="date" className="input"
                  value={date} onChange={(e) => setDate(e.target.value)} required
                />
              </div>
              <div className="field">
                <label htmlFor="slot">Time slot</label>
                <select
                  id="slot" className="input"
                  value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)} required
                >
                  <option value="">Select a slot</option>
                  {TIME_SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={!selectedTrainer}>
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassesPage