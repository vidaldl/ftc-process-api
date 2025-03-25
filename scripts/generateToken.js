#!/usr/bin/env node

/**
 * Token generation script
 * Run with npm run generate-token -- --description "API access for Client X" --days 90
 */

// Setup environment first
require('dotenv').config();

const { initializeDatabase } = require('../config/database');
const TokenService = require('../services/tokenService');
const readline = require('readline');

// Process command line arguments
const args = process.argv.slice(2);
const options = {
  description: 'API Access Token',
  days: null // Default from config if not specified
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--description' && args[i + 1]) {
    options.description = args[i + 1];
    i++;
  } else if (args[i] === '--days' && args[i + 1]) {
    const days = parseInt(args[i + 1], 10);
    options.days = isNaN(days) ? null : days;
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log('Usage: npm run generate-token -- [options]');
    console.log('');
    console.log('Options:');
    console.log('  --description "text"     Description of the token purpose');
    console.log('  --days number           Number of days until token expiration');
    console.log('  --help, -h              Show this help message');
    process.exit(0);
  }
}

// Initialize the database
initializeDatabase();

// Ask for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\nGenerating a new API token with the following settings:');
console.log(`- Description: ${options.description}`);
console.log(`- Expiration: ${options.days ? `${options.days} days` : 'Default from environment config'}`);
console.log('\nWARNING: The token will only be displayed once.\n');

rl.question('Continue? (y/n): ', async (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Token generation cancelled.');
    rl.close();
    return;
  }

  try {
    // Generate the token
    const result = await TokenService.createToken(options.description, options.days);
    
    if (!result.success) {
      console.error('\nError generating token:', result.error);
      process.exit(1);
    }

    console.log('\n========= TOKEN CREATED SUCCESSFULLY =========');
    console.log('\nToken (Save this - it will not be shown again):');
    console.log('\n' + result.token + '\n');
    console.log(`Expires at: ${new Date(result.expiresAt).toLocaleString()}`);
    console.log('\nTo use this token in API requests:');
    console.log('Authorization: Bearer ' + result.token);
    console.log('\n=============================================\n');
    
  } catch (error) {
    console.error('\nUnexpected error generating token:', error.message);
    process.exit(1);
  }
  
  rl.close();
});