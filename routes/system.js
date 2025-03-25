const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { db } = require('../config/database');
const TokenService = require('../services/tokenService');
const os = require('os');

/**
 * @route GET /system/health
 * @description Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  const healthcheck = {
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  };

  try {
    // Check database connection
    db.prepare('SELECT 1').get();
    healthcheck.database = 'connected';
  } catch (error) {
    healthcheck.database = 'error';
    healthcheck.databaseError = error.message;
    return res.status(503).json(healthcheck);
  }

  return res.json(healthcheck);
});

/**
 * @route GET /system/info
 * @description System information (protected)
 * @access Protected
 */
router.get('/info', authenticate(), (req, res) => {
  // Clean up expired tokens on this call
  TokenService.cleanupTokens();
  
  const systemInfo = {
    status: 'success',
    data: {
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: {
          free: os.freemem(),
          total: os.totalmem()
        },
        cpus: os.cpus().length,
        uptime: os.uptime()
      },
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid
      }
    }
  };

  res.json(systemInfo);
});

module.exports = router;