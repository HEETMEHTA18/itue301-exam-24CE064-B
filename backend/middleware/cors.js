/**
 * Minimal hand-rolled CORS middleware.
 *
 * Written by hand instead of pulling in the `cors` package so the backend
 * runs with zero extra dependencies. Allowed origins come from the
 * CORS_ORIGIN env var (comma-separated); "*" allows any origin.
 */
const rawOrigins = process.env.CORS_ORIGIN || '*';
const allowList = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);
const allowAny = allowList.includes('*');

const cors = (req, res, next) => {
  const origin = req.headers.origin;

  if (allowAny) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && allowList.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Answer the preflight without touching the routes.
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  return next();
};

module.exports = cors;
