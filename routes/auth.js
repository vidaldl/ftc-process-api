const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const TokenService = require('../services/tokenService');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../utils/validator');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { ApiError } = require('../middleware/errorHandler');

/**
 * @route GET /auth/tokens
 * @description List all active tokens
 * @access Protected
 */
router.get('/tokens', 
  authenticate(),
  async (req, res, next) => {
    try {
      const includeRevoked = req.query.includeRevoked === 'true';
      const tokens = TokenService.listTokens(includeRevoked);
      
      res.json({
        status: 'success',
        data: tokens
      });
    } catch (error) {
      next(new ApiError('Failed to retrieve tokens', 500));
    }
  }
);

/**
 * @route POST /auth/tokens/revoke/:id
 * @description Revoke a token by ID
 * @access Protected
 */
router.post('/tokens/revoke/:id',
  authenticate(),
  strictRateLimiter,
  [
    param('id').isInt().withMessage('Token ID must be an integer')
  ],
  validate([
    param('id')
  ]),
  async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      const result = TokenService.revokeToken(id);
      
      if (!result.success) {
        return next(new ApiError(result.error, 400));
      }
      
      res.json({
        status: 'success',
        message: 'Token revoked successfully'
      });
    } catch (error) {
      next(new ApiError('Failed to revoke token', 500));
    }
  }
);

/**
 * @route POST /auth/validate
 * @description Validate the current token (useful for clients to check token validity)
 * @access Protected
 */
router.post('/validate',
  authenticate(),
  (req, res) => {
    // If we've reached here, authentication middleware has already validated the token
    res.json({
      status: 'success',
      message: 'Token is valid',
      data: {
        expiresAt: req.token.expiresAt
      }
    });
  }
);

module.exports = router;