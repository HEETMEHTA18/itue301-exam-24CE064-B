const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env from this directory explicitly so `node backend/server.js`
// works from the repo root too, not just from inside /backend.
dotenv.config({ path: path.join(__dirname, '.env') });

const cors = require('./middleware/cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// ---------------------------------------------------------------------------
// Fail fast on missing configuration rather than 500-ing at request time.
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to backend/.env and fill in the values.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// Global middleware — order matters.
// ---------------------------------------------------------------------------
app.use(cors);                              // 1. CORS / preflight
app.use(requestLogger);                     // 2. log EVERY request
app.use(express.json({ limit: '10kb' }));   // 3. body parsing

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', require('./routes/auth'));          // public (+ /me protected)
app.use('/api/v1/trainers', require('./routes/trainers'));   // public
app.use('/api/v1/bookings', require('./routes/bookings'));   // protected per-route

// Health check — also reports live DB state, useful for hosting probes.
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];
app.get('/', (req, res) => res.json({
  message: 'FitZone API running',
  version: 'v1',
  database: DB_STATES[mongoose.connection.readyState] || 'unknown',
  endpoints: [
    'POST   /api/v1/auth/register',
    'POST   /api/v1/auth/login',
    'GET    /api/v1/auth/me',
    'GET    /api/v1/trainers',
    'POST   /api/v1/bookings',
    'GET    /api/v1/bookings/my',
    'GET    /api/v1/bookings          (admin)',
    'PATCH  /api/v1/bookings/:id/status'
  ]
}));

// Unknown route -> JSON 404 instead of Express's default HTML page.
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler — must be registered last.
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Start: connect to MongoDB first, then listen. Prevents the server from
// accepting traffic it cannot serve.
// ---------------------------------------------------------------------------
let server;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    server = app.listen(PORT, () => {
      console.log(`FitZone API listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    console.error('Check MONGO_URI in backend/.env and that your IP is allow-listed in Atlas.');
    process.exit(1);
  }
}

// Log connection drops that happen after a successful initial connect.
mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

// ---------------------------------------------------------------------------
// Graceful shutdown: stop accepting connections, then close the DB pool.
// ---------------------------------------------------------------------------
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close(false);
    console.log('Closed HTTP server and MongoDB connection.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err.message);
    process.exit(1);
  }
}

['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  shutdown('unhandledRejection');
});

// Only auto-start when run directly, so tests can import the app.
if (require.main === module) start();

module.exports = app;
