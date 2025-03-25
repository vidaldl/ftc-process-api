require('dotenv').config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production'
  },
  security: {
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpirationDays: parseInt(process.env.TOKEN_EXPIRATION_DAYS || '30', 10)
  },
  database: {
    path: process.env.DB_PATH || './data/database.sqlite'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10)
  }
};

// Validate essential configuration
if (!config.security.tokenSecret && config.server.isProduction) {
  throw new Error('TOKEN_SECRET is required in production environment');
}

module.exports = config;