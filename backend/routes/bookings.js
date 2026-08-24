const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const ClassBooking = require('../models/ClassBooking');
const Trainer = require('../models/Trainer');
const authGuard = require('../middleware/authGuard');
const { adminGuard } = require('../middleware/authGuard');

const VALID_STATUSES = ['booked', 'attended', 'cancelled'];

/** Reject malformed ids before they reach Mongoose (avoids a 500 CastError). */
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * POST /api/v1/bookings   (protected)
 * Creates a booking for the *logged-in* member.
 * 201 created | 400 validation | 401 no token | 404 trainer missing | 409 slot taken
 */
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { trainerId, className, date, timeSlot } = req.body || {};

    // memberId comes from the verified JWT, NEVER from the request body.
    // Trusting req.body.memberId would let any member book on someone
    // else's behalf (mass-assignment / broken object-level authorisation).
    const memberId = req.member.id;

    if (!trainerId || !isValidId(trainerId)) {
      return res.status(400).json({ message: 'A valid trainerId is required' });
    }

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({ message: 'Trainer not found' });
    }
    if (!trainer.available) {
      return res.status(409).json({ message: `${trainer.name} is fully booked` });
    }

    // Prevent the double-booking the whole project exists to eliminate.
    const clash = await ClassBooking.findOne({
      trainerId, date, timeSlot, status: 'booked'
    });
    if (clash) {
      return res.status(409).json({ message: `That slot with ${trainer.name} is already booked` });
    }

    const booking = await ClassBooking.create({
      memberId, trainerId, className, date, timeSlot
      // status intentionally omitted -> schema default 'booked'
    });

    return res.status(201).json({ message: 'Booking created', booking });
  } catch (err) {
    return next(err); // ValidationError -> 400 via global errorHandler
  }
});

/**
 * GET /api/v1/bookings/my   (protected)
 * Returns only the logged-in member's bookings, with refs populated.
 * Declared before /:id routes so "my" is never parsed as an id.
 */
router.get('/my', authGuard, async (req, res, next) => {
  try {
    const bookings = await ClassBooking.find({ memberId: req.member.id })
      .populate('memberId', 'name email')
      .populate('trainerId', 'name specialization')
      .sort({ date: 1, timeSlot: 1 });

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/v1/bookings   (protected, admin only)
 * Full roster view for the Admin Panel.
 * 403 for authenticated non-admins.
 */
router.get('/', authGuard, adminGuard, async (req, res, next) => {
  try {
    const bookings = await ClassBooking.find({})
      .populate('memberId', 'name email membershipType')
      .populate('trainerId', 'name specialization')
      .sort({ createdAt: -1 });

    return res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /api/v1/bookings/:id/status   (protected)
 * Members may only change their OWN bookings; admins may change any.
 * 200 updated | 400 bad status/id | 401 no token | 403 not owner | 404 missing
 */
router.patch('/:id/status', authGuard, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid booking id' });
    }
    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`
      });
    }

    const booking = await ClassBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // IDOR fix: findByIdAndUpdate alone would let member A cancel member B's
    // booking just by guessing the id. Load first, then check ownership.
    const isOwner = booking.memberId.toString() === req.member.id;
    if (!isOwner && req.member.role !== 'admin') {
      return res.status(403).json({ message: 'You can only modify your own bookings' });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({ message: 'Status updated', booking });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
