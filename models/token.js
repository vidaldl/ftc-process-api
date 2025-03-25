const { db } = require('../config/database');
const { hashToken, verifyToken, calculateExpiration } = require('../utils/crypto');
const logger = require('../utils/logger');

/**
 * Token model for handling database operations with authentication tokens
 */
const TokenModel = {
  /**
   * Create a new token in the database
   * @param {string} token - Plain token to hash and store
   * @param {string} description - Purpose of the token
   * @param {number} expirationDays - Days until token expiration
   * @returns {Promise<object>} Result with success status and expiration date
   */
  async create(token, description, expirationDays) {
    try {
      // Hash the token for secure storage
      const tokenHash = await hashToken(token);
      
      // Calculate expiration date
      const currentDate = new Date().toISOString();
      const expiresAt = calculateExpiration(expirationDays);
      
      // Insert token into database
      const stmt = db.prepare(`
        INSERT INTO auth_tokens (token_hash, description, created_at, expires_at)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(tokenHash, description, currentDate, expiresAt);
      
      if (result.changes !== 1) {
        logger.error('Failed to insert token into database');
        return { success: false, error: 'Database insert failed' };
      }
      
      return { success: true, expiresAt };
    } catch (error) {
      logger.error('Error creating token', { error: error.message });
      return { success: false, error: error.message };
    }
  },

  /**
   * Verify a token against stored hashes
   * @param {string} token - Token to verify
   * @returns {Promise<object|null>} Token data if valid, null if invalid
   */
  async verify(token) {
    try {
      // Get all non-expired, non-revoked tokens
      const currentDate = new Date().toISOString();
      const stmt = db.prepare(`
        SELECT id, token_hash, description, expires_at 
        FROM auth_tokens 
        WHERE expires_at > ? AND is_revoked = 0
      `);
      
      const tokens = stmt.all(currentDate);
      
      // No tokens found
      if (!tokens || tokens.length === 0) {
        return null;
      }
      
      // Check each token hash
      for (const tokenData of tokens) {
        const isMatch = await verifyToken(token, tokenData.token_hash);
        
        if (isMatch) {
          return {
            id: tokenData.id,
            description: tokenData.description,
            expiresAt: tokenData.expires_at
          };
        }
      }
      
      // No matching token found
      return null;
    } catch (error) {
      logger.error('Error verifying token', { error: error.message });
      return null;
    }
  },

  /**
   * List all tokens
   * @param {boolean} includeRevoked - Whether to include revoked tokens
   * @returns {Array} List of tokens
   */
  list(includeRevoked = false) {
    try {
      let sql = 'SELECT id, description, created_at, expires_at, is_revoked FROM auth_tokens';
      
      if (!includeRevoked) {
        sql += ' WHERE is_revoked = 0';
      }
      
      sql += ' ORDER BY created_at DESC';
      
      const stmt = db.prepare(sql);
      return stmt.all();
    } catch (error) {
      logger.error('Error listing tokens', { error: error.message });
      return [];
    }
  },

  /**
   * Revoke a token by ID
   * @param {number} id - ID of token to revoke
   * @returns {boolean} Success status
   */
  revoke(id) {
    try {
      const stmt = db.prepare('UPDATE auth_tokens SET is_revoked = 1 WHERE id = ?');
      const result = stmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      logger.error('Error revoking token', { error: error.message });
      return false;
    }
  },

  /**
   * Clean up expired tokens
   * @returns {number} Number of tokens removed
   */
  cleanup() {
    try {
      const currentDate = new Date().toISOString();
      const stmt = db.prepare('DELETE FROM auth_tokens WHERE expires_at < ?');
      const result = stmt.run(currentDate);
      
      return result.changes;
    } catch (error) {
      logger.error('Error cleaning up tokens', { error: error.message });
      return 0;
    }
  }
};

module.exports = TokenModel;