const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * @route GET /api/protected
 * @description Example protected endpoint
 * @access Protected
 */
router.get('/protected', authenticate(), (req, res) => {
  res.json({
    status: 'success',
    message: 'You have access to this protected resource',
    data: {
      token: {
        id: req.token.id,
        expiresAt: req.token.expiresAt
      }
    }
  });
});

/**
 * @route GET /api/public
 * @description Example public endpoint
 * @access Public
 */
router.get('/public', (req, res) => {
  res.json({
    status: 'success',
    message: 'This is a public endpoint',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * @route GET /api/optional-auth
 * @description Example endpoint with optional authentication
 * @access Public with enhanced access when authenticated
 */
router.get('/optional-auth', authenticate(true), (req, res) => {
  const response = {
    status: 'success',
    message: 'This endpoint works with or without authentication',
    data: {
      timestamp: new Date().toISOString(),
      authenticated: !!req.token
    }
  };
  
  // Add token info if authenticated
  if (req.token) {
    response.data.token = {
      id: req.token.id,
      expiresAt: req.token.expiresAt
    };
  }
  
  res.json(response);
});

module.exports = router;