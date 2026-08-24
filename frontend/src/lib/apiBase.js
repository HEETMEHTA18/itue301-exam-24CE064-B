// Base URL for all API calls.
// - Dev: Vite proxy handles /api -> localhost:5000, so default '/api/v1' works.
// - Prod: set VITE_API_URL at build time (e.g. https://fitzone-api.onrender.com/api/v1)
export const API = import.meta.env.VITE_API_URL || '/api/v1'

// Convenience wrapper so pages stay clean: apiFetch('/trainers')
export const apiFetch = (path, options = {}) => fetch(`${API}${path}`, options)