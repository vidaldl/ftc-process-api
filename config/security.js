const helmet = require('helmet');
const cors = require('cors');
const config = require('./environment');

// Configure security middleware settings
const securitySettings = {
  // Helmet configuration
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"]
      }
    },
    xssFilter: true,
    noSniff: true,
    hidePoweredBy: true
  }),
  
  // CORS configuration
  cors: cors({
    origin: config.server.isProduction ? 
      ['https://yourdomain.com'] : // Restrict in production
      '*', // Allow all in development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400 // 24 hours
  })
};

module.exports = securitySettings;