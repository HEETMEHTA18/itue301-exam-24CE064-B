const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const { hashPassword } = require('../utils/password');

const TOKEN_TTL = '2h';

function signToken(member) {
  return jwt.sign(
    { id: member._id.toString(), email: member.email, role: member.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function publicMember(member) {
  return {
    id: member._id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    membershipType: member.membershipType,
    role: member.role
  };
}

/**
 * POST /api/v1/auth/register   (public)
 * Bonus endpoint — lets you create members without running the seed script,
 * and demonstrates schema validation returning 400 with readable messages.
 * 201 on success | 400 validation | 409 duplicate email
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, membershipType } = req.body || {};

    // role is deliberately NOT read from the body — otherwise anyone could
    // self-promote to admin (privilege-escalation via mass assignment).
    const member = await Member.create({ name, email, password, phone, membershipType });

    return res.status(201).json({
      message: 'Member registered',
      token: signToken(member),
      member: publicMember(member)
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'An account with that email already exists' });
    }
    return next(err); // ValidationError -> 400 via global errorHandler
  }
});

/**
 * POST /api/v1/auth/login   (public)
 * 200 on success | 400 missing fields | 401 bad credentials
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // +password re-selects the field excluded by the schema
    const member = await Member.findOne({ email: String(email).toLowerCase() }).select('+password');

    if (!member) {
      // Spend the same CPU as a real comparison so response time does not
      // reveal whether the email exists (user-enumeration defence).
      hashPassword(String(password));
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!member.comparePassword(String(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.status(200).json({
      message: 'Login successful',
      token: signToken(member),
      member: publicMember(member)
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/v1/auth/me   (protected)
 * Handy for confirming a token is valid during testing.
 */
router.get('/me', require('../middleware/authGuard'), async (req, res, next) => {
  try {
    const member = await Member.findById(req.member.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    return res.status(200).json({ member: publicMember(member) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
