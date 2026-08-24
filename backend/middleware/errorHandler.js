/**
 * Global error handler — the last middleware registered in server.js.
 * Converts thrown/next()-ed errors into structured JSON so the client never
 * sees a raw Mongoose object or an HTML stack trace.
 */
const errorHandler = (err, req, res, next) => {
  // Delegate to Express if headers are already sent (e.g. mid-stream failure).
  if (res.headersSent) return next(err);

  console.error(`ERROR ${req.method} ${req.originalUrl}:`, err.message);

  // Mongoose schema validation -> 400 with readable field messages
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: errors.join(', '), errors });
  }

  // Bad ObjectId in a query -> 400 rather than 500
  if (err.name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
  }

  // Duplicate key on a unique index -> 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `That ${field} is already registered` });
  }

  // Malformed JSON body from express.json()
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ message: 'Request body is not valid JSON' });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    message: status === 500 ? 'Internal Server Error' : err.message,
    // Stack only in development — never leak internals in production.
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
