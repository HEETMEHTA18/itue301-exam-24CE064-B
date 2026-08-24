// Password hashing using Node's built-in crypto.scrypt.
// Deliberately avoids bcrypt: no native compilation, no extra dependency,
// and scrypt is memory-hard (recommended by OWASP for password storage).
//
// Stored format:  scrypt$<salt-hex>$<derivedKey-hex>
const crypto = require('crypto');

const SCHEME = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;
const MIN_LENGTH = 8;

/**
 * Hash a plain-text password into a self-describing storable string.
 * @param {string} plain
 * @returns {string} e.g. "scrypt$a1b2...$c3d4..."
 */
function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derived = crypto.scryptSync(plain, salt, KEY_BYTES).toString('hex');
  return `${SCHEME}$${salt}$${derived}`;
}

/**
 * Constant-time verification of a plain-text password against a stored hash.
 * Returns false (never throws) on any malformed input.
 * @param {string} plain
 * @param {string} stored
 * @returns {boolean}
 */
function verifyPassword(plain, stored) {
  if (typeof plain !== 'string' || typeof stored !== 'string') return false;

  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== SCHEME || !salt || !hash) return false;

  let derived;
  try {
    derived = crypto.scryptSync(plain, salt, KEY_BYTES);
  } catch {
    return false;
  }

  const expected = Buffer.from(hash, 'hex');
  // timingSafeEqual throws if lengths differ, so guard first.
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

/** True if the value is already a stored hash rather than plain text. */
function isHashed(value) {
  return typeof value === 'string' && value.startsWith(`${SCHEME}$`);
}

module.exports = { hashPassword, verifyPassword, isHashed, MIN_LENGTH };
