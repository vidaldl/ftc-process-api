#!/bin/bash

# Deployment script for power-process API server
echo "Starting deployment..."

# Pull latest changes
echo "Pulling latest changes from git repository..."
git pull

# Install dependencies
echo "Installing production dependencies..."
npm ci --production

# Create data directory if it doesn't exist
echo "Setting up data directory..."
mkdir -p data
chmod 750 data

# Create logs directory if it doesn't exist
echo "Setting up logs directory..."
mkdir -p logs
chmod 750 logs

# Restart application using PM2
echo "Restarting application..."
pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js

echo "Deployment completed successfully!"