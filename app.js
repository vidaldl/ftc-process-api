const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import configuration
const config = require('./config/environment');
const securitySettings = require('./config/security');
const { initializeDatabase } = require('./config/database');

// Import middleware
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { apiRateLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');
const systemRoutes = require('./routes/system');

// Initialize the database
initializeDatabase();

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
}

// Initialize Express app
const app = express();

// Request ID middleware - assigns a unique ID to each request for tracking
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Apply security middleware
app.use(securitySettings.helmet);
app.use(securitySettings.cors);

// Apply standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging middleware
app.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', { 
  stream: logger.stream 
}));
app.use(logger.requestLogger);

// Apply rate limiter to all routes
app.use(apiRateLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use('/system', systemRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'API server is running',
    documentation: '/api-docs',
    version: '1.0.0'
  });
});

// 404 Handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

module.exports = app;