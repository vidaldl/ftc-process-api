const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, additionalInfo = {}) {
    super(message);
    this.statusCode = statusCode;
    this.additionalInfo = additionalInfo;
    this.name = 'ApiError';
  }
}

/**
 * Middleware to handle 404 not found errors
 */
function notFoundHandler(req, res, next) {
  const error = new ApiError(`Not found: ${req.originalUrl}`, 404);
  next(error);
}

/**
 * Centralized error handling middleware
 */
function errorHandler(err, req, res, next) {
  // Set default status code
  const statusCode = err.statusCode || 500;
  
  // Log the error (with stack trace in development)
  const logObject = {
    url: req.originalUrl,
    method: req.method,
    statusCode,
    requestId: req.id
  };

  if (err.additionalInfo) {
    logObject.additionalInfo = err.additionalInfo;
  }

  if (!config.server.isProduction) {
    logObject.stack = err.stack;
  }

  if (statusCode >= 500) {
    logger.error(`${err.name || 'Error'}: ${err.message}`, logObject);
  } else {
    logger.warn(`${err.name || 'Error'}: ${err.message}`, logObject);
  }
  
  // Send error response
  return res.status(statusCode).json({
    status: 'error',
    message: config.server.isProduction && statusCode === 500
      ? 'Internal server error'
      : err.message
  });
}

module.exports = {
  ApiError,
  notFoundHandler,
  errorHandler
};