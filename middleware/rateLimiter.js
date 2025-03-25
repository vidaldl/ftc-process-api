const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Standard API rate limiter
 */
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // Time window in milliseconds
  max: config.rateLimit.max, // Max requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many requests. Please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl
    });
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * More strict rate limiter for sensitive endpoints
 */
const strictRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs / 3, // Shorter window
  max: config.rateLimit.max / 5, // Fewer requests allowed
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Rate limit exceeded for sensitive operation. Please try again later.'
  },
  handler: (req, res, next, options) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      path: req.originalUrl
    });
    res.status(options.statusCode).json(options.message);
  }
});

module.exports = {
  apiRateLimiter,
  strictRateLimiter
};