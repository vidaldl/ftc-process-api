#!/usr/bin/env node

/**
 * Token Management Script
 * This script helps manage API tokens, including listing, revoking, and generating replacements
 * Run with: npm run manage-tokens
 */

require('dotenv').config();
const { initializeDatabase } = require('../config/database');
const TokenService = require('../services/tokenService');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize database
initializeDatabase();

async function showMenu() {
  console.log('\n=== Token Management ===');
  console.log('1. List active tokens');
  console.log('2. List all tokens (including revoked)');
  console.log('3. Revoke token');
  console.log('4. Generate replacement token');
  console.log('5. Exit');
  
  const answer = await new Promise(resolve => {
    rl.question('\nSelect an option (1-5): ', resolve);
  });

  switch(answer) {
    case '1':
      await listTokens(false);
      break;
    case '2':
      await listTokens(true);
      break;
    case '3':
      await revokeToken();
      break;
    case '4':
      await generateReplacement();
      break;
    case '5':
      console.log('\nGoodbye!');
      rl.close();
      return;
    default:
      console.log('Invalid option');
  }

  await showMenu();
}

async function listTokens(includeRevoked = false) {
  const tokens = TokenService.listTokens(includeRevoked);
  
  console.log(`\n${includeRevoked ? 'All' : 'Active'} Tokens:`);
  if (tokens.length === 0) {
    console.log('No tokens found.');
    return;
  }

  tokens.forEach(token => {
    console.log('\n-------------------');
    console.log(`ID: ${token.id}`);
    console.log(`Description: ${token.description}`);
    console.log(`Created: ${new Date(token.createdAt).toLocaleString()}`);
    console.log(`Expires: ${new Date(token.expiresAt).toLocaleString()}`);
    if (includeRevoked) {
      console.log(`Status: ${token.isRevoked ? 'Revoked' : 'Active'}`);
    }
    console.log('-------------------');
  });
}

async function revokeToken() {
  // Show active tokens first
  await listTokens(false);

  const id = await new Promise(resolve => {
    rl.question('\nEnter token ID to revoke: ', resolve);
  });

  const confirm = await new Promise(resolve => {
    rl.question(`Are you sure you want to revoke token ${id}? (y/n): `, resolve);
  });

  if (confirm.toLowerCase() !== 'y') {
    console.log('Token revocation cancelled.');
    return;
  }

  const result = TokenService.revokeToken(parseInt(id, 10));
  if (result.success) {
    console.log('\nToken successfully revoked.');
  } else {
    console.log('\nFailed to revoke token:', result.error);
  }
}

async function generateReplacement() {
  console.log('\nGenerating replacement token...');
  
  const description = await new Promise(resolve => {
    rl.question('Enter description for new token: ', resolve);
  });
  
  const days = await new Promise(resolve => {
    rl.question('Enter expiration days (or press enter for default): ', resolve);
  });

  const confirm = await new Promise(resolve => {
    rl.question('\nGenerate token with these settings? (y/n): ', resolve);
  });

  if (confirm.toLowerCase() !== 'y') {
    console.log('Token generation cancelled.');
    return;
  }

  const result = await TokenService.createToken(
    description, 
    days ? parseInt(days, 10) : undefined
  );

  if (result.success) {
    console.log('\n========= NEW TOKEN GENERATED SUCCESSFULLY =========');
    console.log('\nToken (Save this - it will not be shown again):');
    console.log('\n' + result.token + '\n');
    console.log(`Expires at: ${new Date(result.expiresAt).toLocaleString()}`);
    console.log('\nTo use this token in API requests:');
    console.log('Authorization: Bearer ' + result.token);
    console.log('\n================================================\n');
  } else {
    console.log('\nFailed to generate token:', result.error);
  }
}

// Start the menu
console.log('\nToken Management Utility');
console.log('Use this tool to manage your API tokens, including:');
console.log('- View active and revoked tokens');
console.log('- Revoke lost or compromised tokens');
console.log('- Generate replacement tokens\n');

showMenu().catch(error => {
  console.error('An error occurred:', error.message);
  rl.close();
});