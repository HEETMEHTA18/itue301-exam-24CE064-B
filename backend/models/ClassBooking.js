const mongoose = require('mongoose');

const classBookingSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member reference is required']
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: [true, 'Trainer reference is required']
  },
  className: {
    type: String,
    required: [true, 'Class name is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required']
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required']
  },
  status: {
    type: String,
    enum: ['booked', 'attended', 'cancelled'],
    default: 'booked'
  }
}, { timestamps: true });

module.exports = mongoose.model('ClassBooking', classBookingSchema);