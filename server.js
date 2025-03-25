const http = require('http');
const app = require('./app');
const config = require('./config/environment');
const logger = require('./utils/logger');

// Get port from environment and store in Express
const port = config.server.port;
app.set('port', port);

// Create HTTP server
const server = http.createServer(app);

// Error handling for server
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      logger.error(`Port ${port} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`Port ${port} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Start listening on provided port
server.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
  logger.info(`Environment: ${config.server.nodeEnv}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});