const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');

/**
 * GET /api/v1/trainers   (public — no token required)
 * Optional ?specialization=yoga filter, though the React client filters
 * client-side to avoid a round-trip on every keystroke.
 * 200 always (empty array if none).
 */
router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.specialization) {
      // Escape regex metacharacters so user input can't alter the pattern.
      const safe = String(req.query.specialization).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.specialization = new RegExp(safe, 'i');
    }

    const trainers = await Trainer.find(filter).sort({ name: 1 });
    return res.status(200).json({ count: trainers.length, trainers });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/v1/trainers/:id   (public)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    return res.status(200).json({ trainer });
  } catch (err) {
    return next(err); // CastError -> 400 via errorHandler
  }
});

module.exports = router;
