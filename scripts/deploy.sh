#!/bin/bash

# Deployment script for power-process API server
echo "Starting deployment..."

# Pull latest changes
echo "Pulling latest changes from git repository..."
sudo git pull

# Install dependencies
echo "Installing production dependencies..."
sudo npm ci --production

# Create data directory if it doesn't exist
echo "Setting up data directory..."
sudo mkdir -p data
sudo chmod 750 data

# Create logs directory if it doesn't exist
echo "Setting up logs directory..."
sudo mkdir -p logs
sudo chmod 750 logs

# Restart application using PM2
sudo echo "Restarting application..."
sudo pm2 reload ecosystem.config.js || sudo pm2 start ecosystem.config.js

echo "Deployment completed successfully!"