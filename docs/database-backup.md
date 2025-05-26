# Database Backup Guide for Supabase

This guide outlines how to set up regular backups for your Supabase database to ensure data safety and business continuity.

## Supabase Built-in Backups

Supabase provides automatic daily backups on paid plans:

1. **Standard Plan (Pro)**:
   - Daily backups
   - 7-day retention
   - Point-in-time recovery

2. **Enterprise Plan**:
   - Custom backup schedules
   - Extended retention periods
   - Dedicated support for recovery

## Manual Backup Process

For additional safety or if you're on the free plan, you can implement your own backup solution:

### 1. Using pg_dump (CLI)

```bash
# Install PostgreSQL client tools if needed
# Ubuntu/Debian: sudo apt-get install postgresql-client
# macOS: brew install postgresql

# Set environment variables
export PGPASSWORD=your_database_password

# Run pg_dump to create a backup
pg_dump -h db.your-project-ref.supabase.co -p 5432 -U postgres -d postgres -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Compress the backup
gzip backup_$(date +%Y%m%d_%H%M%S).dump
```

### 2. Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create a database dump
supabase db dump -p your-project-ref -f backup_$(date +%Y%m%d_%H%M%S).sql
```

## Automated Backup Script

Create a script to automate the backup process:

```bash
#!/bin/bash
# backup_supabase.sh

# Configuration
BACKUP_DIR="/path/to/backup/directory"
SUPABASE_URL="db.your-project-ref.supabase.co"
SUPABASE_PASSWORD="your_database_password"
SUPABASE_PORT=5432
SUPABASE_USER="postgres"
SUPABASE_DB="postgres"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.dump"

# Set PostgreSQL password
export PGPASSWORD="$SUPABASE_PASSWORD"

# Perform backup
pg_dump -h "$SUPABASE_URL" -p "$SUPABASE_PORT" -U "$SUPABASE_USER" -d "$SUPABASE_DB" -F c -f "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Delete backups older than 30 days
find "$BACKUP_DIR" -name "backup_*.dump.gz" -type f -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

Make the script executable:

```bash
chmod +x backup_supabase.sh
```

## Scheduling Automated Backups

### Using Cron (Linux/macOS)

Schedule daily backups at 2 AM:

```bash
# Edit crontab
crontab -e

# Add this line
0 2 * * * /path/to/backup_supabase.sh >> /path/to/backup.log 2>&1
```

### Using Task Scheduler (Windows)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set trigger to daily at 2 AM
4. Set action to start a program
5. Browse to your script location
6. Finish the wizard

## Backup Storage Best Practices

1. **Offsite Storage**:
   - Copy backups to a cloud storage service (AWS S3, Google Cloud Storage, Azure Blob Storage)
   - Use services like rclone to automate this process

2. **Encryption**:
   - Encrypt sensitive backup files before storing them offsite
   - Use tools like gpg for encryption

3. **Verification**:
   - Regularly test restoring from your backups to ensure they work
   - Set up monitoring to verify backups are being created successfully

## Restoration Process

```bash
# Restore from a compressed backup
gunzip backup_20250527_020000.dump.gz

# Restore to the database
pg_restore -h "db.your-project-ref.supabase.co" -p 5432 -U postgres -d postgres --clean backup_20250527_020000.dump
```

## Emergency Contacts

- Supabase Support: [support@supabase.io](mailto:support@supabase.io)
- Documentation: [Supabase Backups](https://supabase.com/docs/guides/platform/backups)

Remember to test your backup and restoration process regularly to ensure it works when needed!
