/**
 * Thin fetch wrapper around the FitZone API.
 *
 * Two jobs:
 *  1. Centralise base URL, JSON encoding, Bearer auth and error shaping.
 *  2. Emit a log record for every call so <ApiLogPanel /> can show live
 *     request activity beside the UI (method, path, status, duration).
 *
 * In dev, VITE_API_BASE_URL is unset and calls go to "/api/v1", which
 * vite.config.js proxies to http://localhost:5000. In production the two
 * apps sit on different origins, so the full URL is supplied via env.
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

/* ------------------------------------------------------------ log bus --- */
const listeners = new Set();
let seq = 0;

/** Subscribe to API log records. Returns an unsubscribe function. */
export function onApiLog(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(record) {
  listeners.forEach((fn) => {
    try {
      fn(record);
    } catch {
      /* a broken listener must never break a request */
    }
  });
}

/* --------------------------------------------------------------- error --- */
export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
  /** True when the request never reached the server. */
  get isNetwork() {
    return this.status === 0;
  }
}

const NETWORK_MESSAGE =
  'Cannot reach the API. Make sure the backend is running on http://localhost:5000';

/* --------------------------------------------------------------- fetch --- */
/**
 * @param {string} path   e.g. "/trainers" (appended to the base URL)
 * @param {object} [opts]
 * @param {string} [opts.method='GET']
 * @param {any}    [opts.body]   plain object, JSON-encoded automatically
 * @param {string} [opts.token]  JWT for the Authorization header
 * @returns {Promise<any>} parsed JSON body
 * @throws {ApiError}
 */
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const url = `${BASE}${path}`;
  const startedAt = performance.now();

  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response = null;
  let payload = null;
  let networkError = null;

  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Read as text first: 204s and error pages are not always valid JSON.
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = { message: text.slice(0, 200) };
      }
    }
  } catch (err) {
    networkError = err;
  }

  const durationMs = performance.now() - startedAt;

  emit({
    id: ++seq,
    method,
    path: url,
    status: response ? response.status : 0,
    ok: Boolean(response && response.ok),
    durationMs,
    at: new Date(),
    message: networkError ? 'Network error' : payload?.message || null,
  });

  if (networkError) throw new ApiError(NETWORK_MESSAGE, 0);

  if (!response.ok) {
    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return payload;
}

/* ------------------------------------------------- endpoint shortcuts --- */
export const api = {
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: { email, password } }),

  register: (payload) =>
    apiFetch('/auth/register', { method: 'POST', body: payload }),

  me: (token) => apiFetch('/auth/me', { token }),

  trainers: () => apiFetch('/trainers'),

  createBooking: (token, booking) =>
    apiFetch('/bookings', { method: 'POST', body: booking, token }),

  myBookings: (token) => apiFetch('/bookings/my', { token }),

  allBookings: (token) => apiFetch('/bookings', { token }),

  setBookingStatus: (token, id, status) =>
    apiFetch(`/bookings/${id}/status`, { method: 'PATCH', body: { status }, token }),
};
