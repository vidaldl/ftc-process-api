const TokenModel = require('../models/token');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate API requests using bearer tokens
 * @param {boolean} optional - If true, request can proceed without token
 * @returns {Function} Express middleware function
 */
function authenticate(optional = false) {
  return async (req, res, next) => {
    try {
      // Extract authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        if (optional) {
          return next();
        }
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      // Check for Bearer token format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid authorization format. Use Bearer <token>'
        });
      }

      const token = parts[1];
      
      // Verify the token
      const tokenData = await TokenModel.verify(token);

      if (!tokenData) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token'
        });
      }

      // Attach token data to the request object
      req.token = tokenData;
      
      // Continue to the next middleware/route handler
      next();
    } catch (error) {
      logger.error('Authentication error', { error: error.message });
      return res.status(500).json({
        status: 'error',
        message: 'Authentication error'
      });
    }
  };
}

module.exports = {
  authenticate
};