#!/bin/bash

# Database Backup Script for CLSU NEXUS
# Run this script via cron for automated backups

set -e

# Configuration
BACKUP_DIR="/var/backups/clsu-nexus/database"
DB_NAME="${DB_NAME:-clsu_nexus_prod}"
DB_USER="${DB_USER:-clsu_nexus_user}"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate backup filename
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Perform backup
echo "Creating database backup..."
pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Clean old backups (keep last N days)
echo "Cleaning old backups (keeping last $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed successfully"

