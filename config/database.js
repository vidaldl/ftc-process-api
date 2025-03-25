const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('./environment');

// Ensure data directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database connection
const db = new Database(config.database.path, { 
  verbose: config.server.nodeEnv === 'development' ? console.log : null
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables if they don't exist
function initializeDatabase() {
  // Auth tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      is_revoked INTEGER DEFAULT 0
    )
  `);

  // Add more tables here as needed
  
  console.log('Database initialized successfully');
}

module.exports = {
  db,
  initializeDatabase
};