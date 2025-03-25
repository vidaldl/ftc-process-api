const winston = require('winston');
const config = require('../config/environment');

// Define custom format with timestamp and colorized output
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  config.server.isProduction 
    ? winston.format.json() 
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
      )
);

// Create the winston logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    // Console transport for all logs
    new winston.transports.Console(),
    
    // File transport for error and above logs
    new winston.transports.File({ 
      filename: './logs/error.log', 
      level: 'error',
      dirname: 'logs',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    
    // File transport for all logs
    new winston.transports.File({ 
      filename: './logs/combined.log',
      dirname: 'logs', 
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true 
    })
  ]
});

// Create a stream object for Morgan integration
logger.stream = {
  write: (message) => logger.http(message.trim())
};

// Add request logger middleware
logger.requestLogger = (req, res, next) => {
  // Log at the start of the request
  logger.debug(`${req.method} ${req.originalUrl} started`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    requestId: req.id
  });

  // Log when the request is finished
  res.on('finish', () => {
    const logObj = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: Date.now() - req._startTime,
      ip: req.ip,
      requestId: req.id
    };
    
    // Log at appropriate level based on status code
    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${res.statusCode}`, logObj);
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode}`, logObj);
    } else {
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, logObj);
    }
  });

  // Set request start time and continue
  req._startTime = Date.now();
  next();
};

module.exports = logger;