const crypto = require('crypto');
const bcrypt = require('bcrypt');
const config = require('../config/environment');

/**
 * Generate a cryptographically strong random token
 * @param {number} bytes - Number of bytes for random token
 * @returns {string} - Base64 URL-safe encoded token
 */
function generateToken(bytes = 32) {
  return crypto.randomBytes(bytes)
    .toString('base64url');
}

/**
 * Hash a token for secure storage
 * @param {string} token - The plain token
 * @returns {Promise<string>} - Hashed token
 */
async function hashToken(token) {
  const saltRounds = 10;
  return bcrypt.hash(token, saltRounds);
}

/**
 * Verify a token against a stored hash
 * @param {string} token - The plain token to verify
 * @param {string} hash - The stored hash
 * @returns {Promise<boolean>} - Whether the token matches the hash
 */
async function verifyToken(token, hash) {
  return bcrypt.compare(token, hash);
}

/**
 * Calculate token expiration date
 * @param {number} days - Days until expiration
 * @returns {string} - ISO string of expiration date
 */
function calculateExpiration(days = config.security.tokenExpirationDays) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

module.exports = {
  generateToken,
  hashToken,
  verifyToken,
  calculateExpiration
};