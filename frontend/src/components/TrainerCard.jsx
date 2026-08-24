import { useState } from 'react'

// TrainerCard: reusable, receives ALL data via props (no hardcoded values).
// available=true  -> "Available"     (green badge)
// available=false -> "Fully Booked"  (red badge)
const AVAILABILITY_LABELS = { true: 'Available', false: 'Fully Booked' }

const TrainerCard = ({ name, specialization, available, onSelect, selected }) => {
  return (
    <div
      onClick={onSelect}
      style={{
        border: `2px solid ${selected ? '#2196f3' : '#ddd'}`,
        borderRadius: 8,
        padding: 16,
        width: 220,
        cursor: 'pointer',
        background: selected ? '#e3f2fd' : '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>{name}</h3>
      <p style={{ margin: '0 0 8px' }}><strong>Specialization:</strong> {specialization}</p>
      {/* Object map keeps the conditional clean (exam hint) */}
      <span
        style={{
          padding: '4px 10px',
          borderRadius: 12,
          color: '#fff',
          background: available ? '#4caf50' : '#f44336',
          fontSize: 13,
        }}
      >
        {AVAILABILITY_LABELS[String(available)]}
      </span>
    </div>
  )
}

export default TrainerCard