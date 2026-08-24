// TrainerCard: reusable, receives ALL data via props (no hardcoded values).
// available=true  -> "Available"     (green pill)
// available=false -> "Fully Booked"  (red pill)
const AVAILABILITY_LABELS = { true: 'Available', false: 'Fully Booked' }

const TrainerCard = ({ name, specialization, available, onSelect, selected }) => {
  // initials for the avatar circle
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      onClick={onSelect}
      className={[
        'trainer-card',
        selected ? 'trainer-card--selected' : '',
        !available ? 'trainer-card--unavailable' : '',
      ].join(' ').trim()}
    >
      <div className="trainer-top">
        <span className="trainer-avatar">{initials}</span>
        <div>
          <h3 className="trainer-name">{name}</h3>
          <p className="trainer-spec">{specialization}</p>
        </div>
      </div>
      {/* Object map keeps the conditional clean (exam hint) */}
      <span className={`pill ${available ? 'pill--ok' : 'pill--bad'}`}>
        {AVAILABILITY_LABELS[String(available)]}
      </span>
    </div>
  )
}

export default TrainerCard