#!/bin/bash

# Database backup script for power-process API server
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="../backups"
DB_FILE="../data/database.sqlite"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
cp $DB_FILE "$BACKUP_DIR/database_$TIMESTAMP.sqlite"

# Remove backups older than 7 days
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "database_*.sqlite" -mtime +7 -delete

echo "Backup completed successfully!"