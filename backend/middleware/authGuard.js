const jwt = require('jsonwebtoken');

/**
 * authGuard — validates the Bearer token and attaches req.member.
 * Applied to every protected route; /auth/login, /auth/register and
 * GET /api/v1/trainers stay public.
 * 401 on missing header, malformed header, bad signature or expired token.
 */
const authGuard = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // { id, email, role } as signed in routes/auth.js
    req.member = decoded;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Token has expired, please log in again'
      : 'Invalid or expired token';
    return res.status(401).json({ message });
  }
};

/**
 * adminGuard — must run *after* authGuard. Blocks non-admin members.
 * 403 (not 401): the caller is authenticated but not authorised.
 */
const adminGuard = (req, res, next) => {
  if (!req.member || req.member.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  return next();
};

module.exports = authGuard;
module.exports.authGuard = authGuard;
module.exports.adminGuard = adminGuard;
