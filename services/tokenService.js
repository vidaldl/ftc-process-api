const TokenModel = require('../models/token');
const { generateToken } = require('../utils/crypto');
const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Service for token management operations
 */
const TokenService = {
  /**
   * Create a new authentication token
   * @param {string} description - Purpose of the token
   * @param {number} expirationDays - Days until token expiration
   * @returns {Promise<object>} - Created token info
   */
  async createToken(description, expirationDays = config.security.tokenExpirationDays) {
    try {
      // Generate a new random token
      const plainToken = generateToken(32);
      
      // Store it in the database
      const result = await TokenModel.create(plainToken, description, expirationDays);
      
      if (!result.success) {
        logger.error('Failed to create token', { error: result.error });
        return { success: false, error: 'Token creation failed' };
      }
      
      // Return the plaintext token (only time it's available)
      return {
        success: true,
        token: plainToken,
        expiresAt: result.expiresAt
      };
    } catch (error) {
      logger.error('Error in token creation service', { error: error.message });
      return { success: false, error: 'Token creation failed' };
    }
  },
  
  /**
   * List active tokens
   * @param {boolean} includeRevoked - Whether to include revoked tokens
   * @returns {Array} - List of token metadata
   */
  listTokens(includeRevoked = false) {
    try {
      const tokens = TokenModel.list(includeRevoked);
      
      // Return tokens without sensitive data
      return tokens.map(token => ({
        id: token.id,
        description: token.description,
        createdAt: token.created_at,
        expiresAt: token.expires_at,
        isRevoked: !!token.is_revoked
      }));
    } catch (error) {
      logger.error('Error listing tokens', { error: error.message });
      return [];
    }
  },
  
  /**
   * Revoke an existing token
   * @param {number} id - Token ID to revoke
   * @returns {object} - Result of revocation
   */
  revokeToken(id) {
    try {
      const success = TokenModel.revoke(id);
      
      if (!success) {
        return { success: false, error: 'Token not found or already revoked' };
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error revoking token', { error: error.message });
      return { success: false, error: 'Token revocation failed' };
    }
  },
  
  /**
   * Clean up expired tokens
   * @returns {object} - Cleanup result
   */
  cleanupTokens() {
    try {
      const removedCount = TokenModel.cleanup();
      logger.info(`Cleaned up ${removedCount} expired tokens`);
      
      return { success: true, removedCount };
    } catch (error) {
      logger.error('Token cleanup failed', { error: error.message });
      return { success: false, error: 'Token cleanup failed' };
    }
  }
};

module.exports = TokenService;