const { validationResult } = require('express-validator');

/**
 * Middleware to validate request based on express-validator rules
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
function validate(validations) {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    // Return validation errors
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
}

module.exports = {
  validate
};