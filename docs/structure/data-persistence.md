# Data Persistence

## Overview

Data persistence strategy using SQLite database for user accounts and JSON files for settings, search history, and logs. Backed by Docker volume mounts for reliability.

## Storage Architecture

### SQLite Database

**File:** `backend/data/users.db`

**Purpose:** User authentication and authorization

**Schema:**

**users table:**

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT - Unique user identifier
- `username` - TEXT UNIQUE NOT NULL - Login username
- `password` - TEXT NOT NULL - bcrypt hashed password
- `isAdmin` - INTEGER DEFAULT 0 - Admin flag (0 = user, 1 = admin)
- `createdAt` - TEXT DEFAULT CURRENT_TIMESTAMP - Registration timestamp

**Indexes:**

- Primary key on `id` (automatic)
- Unique index on `username`

**Size:** Small (~1-10 MB for typical usage)

**Growth:** Linear với number of users

**Access Pattern:** Read-heavy (auth checks), occasional writes (registration)

**Backup:** Included trong volume backups

### JSON Files

#### `settings.json`

**Purpose:** Per-user application settings (qBittorrent, Jellyfin)

**Structure:**

```json
{
  "users": {
    "1": {
      "qbittorrent": {
        "url": "http://192.168.1.100:8080",
        "username": "admin",
        "password": "adminpass"
      },
      "jellyfin": {
        "url": "http://192.168.1.100:8096",
        "apiKey": "abc123xyz"
      }
    },
    "2": {
      "qbittorrent": {...},
      "jellyfin": {...}
    }
  }
}
```

**Access Control:** Users can only read/write own settings (filtered by `req.user.id`)

**Size:** ~1-5 KB per user

**Growth:** Linear với number of users

**Sensitive Data:** Contains passwords and API keys (gitignored, chmod 600)

#### `search-history.json`

**Purpose:** Track user search queries and results

**Structure:**

```json
[
  {
    "id": "uuid-1",
    "userId": 1,
    "query": "Inception",
    "timestamp": "2024-01-15T10:30:00Z",
    "results": 10
  },
  {
    "id": "uuid-2",
    "userId": 2,
    "query": "The Matrix",
    "timestamp": "2024-01-15T11:00:00Z",
    "results": 25
  }
]
```

**Access Control:** Users can only see own history (filtered by `userId`)

**Size:** ~200-500 bytes per entry

**Growth:** Controlled by rotation (max 1000 entries)

**Retention:** Keep last 1000 searches, delete oldest when full

#### `logs.json`

**Purpose:** System logs and debugging information

**Structure:**

```json
[
  {
    "timestamp": "2024-01-15T12:00:00Z",
    "level": "INFO",
    "message": "User logged in",
    "details": {
      "userId": 1,
      "username": "admin",
      "ip": "192.168.1.50"
    }
  },
  {
    "timestamp": "2024-01-15T12:05:00Z",
    "level": "ERROR",
    "message": "API request failed",
    "details": {
      "endpoint": "/api/torrent/search",
      "error": "Connection timeout"
    }
  }
]
```

**Access Control:** Admin only (`/api/logs` route)

**Levels:** INFO, WARN, ERROR, DEBUG

**Size:** ~300-800 bytes per entry

**Growth:** Controlled by rotation (max 1000 entries)

**Retention:** Keep last 1000 log entries

## Data Access Layer

### SQLite Operations

**Initialization:**

- Database file created on first run
- `users` table created if not exists
- Connection opened at app startup
- Connection reused across requests

**Queries:**

All queries use prepared statements (parameterized) for SQL injection prevention.

**Insert User:**

```sql
INSERT INTO users (username, password, isAdmin) 
VALUES (?, ?, ?)
```

**Find User by Username:**

```sql
SELECT * FROM users WHERE username = ?
```

**Find User by ID:**

```sql
SELECT * FROM users WHERE id = ?
```

**Get All Users:**

```sql
SELECT id, username, isAdmin, createdAt FROM users
```

**Update User:**

```sql
UPDATE users SET password = ?, isAdmin = ? WHERE id = ?
```

**Delete User:**

```sql
DELETE FROM users WHERE id = ?
```

**Error Handling:**

- Unique constraint violation (username already exists)
- Database locked (retry logic)
- Connection errors (fail fast on startup)

### JSON File Operations

**Read Settings:**

1. Read `settings.json` using `fs.promises.readFile()`
2. Parse JSON
3. Access `data.users[userId]`
4. Return user-specific settings or default values

**Write Settings:**

1. Read entire file
2. Parse JSON
3. Update `data.users[userId]`
4. Write back với `fs.promises.writeFile()`
5. Use atomic write (write to temp file, rename)

**Read History:**

1. Read `search-history.json`
2. Parse JSON array
3. Filter by `userId` (unless admin)
4. Sort by timestamp (descending)
5. Return filtered results

**Write History:**

1. Read entire file
2. Parse JSON array
3. Append new entry với UUID and timestamp
4. Rotate if > 1000 entries (remove oldest)
5. Write back

**Read Logs:**

1. Read `logs.json`
2. Parse JSON array
3. Filter by level if specified
4. Limit results (default 100)
5. Return sorted by timestamp (descending)

**Write Logs:**

1. Read entire file
2. Parse JSON array
3. Append new log entry
4. Rotate if > 1000 entries
5. Write back

**Atomic Writes:**

- Write to temporary file first
- Rename to actual file (atomic operation on most filesystems)
- Prevents corruption on crashes

**File Locking:**

- Not implemented (single-threaded Node.js, low concurrency)
- Future: Use proper locking for high concurrency

## Docker Volume Persistence

### Development (`docker-compose.yml`)

**Bind Mount:**

```yaml
volumes:
  - ./backend/data:/app/data
```

**Benefits:**

- Direct access to files on host
- Easy inspection and debugging
- Automatic sync between host and container
- Survives container restarts/rebuilds

**Location:** `./backend/data/` on host machine

### Production (`docker-compose.deploy.yml`)

**Named Volume:**

```yaml
volumes:
  backend-data:/app/data

volumes:
  backend-data:
    driver: local
```

**Benefits:**

- Managed by Docker
- Better performance
- Survives container removal
- Can be backed up với `docker volume` commands

**Location:** Docker manages storage location

**Inspect:**

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect backend-data

# Location (typically)
/var/lib/docker/volumes/backend-data/_data
```

## Backup Strategy

### Manual Backup

**Backup All Data:**

```bash
# Stop services
docker-compose down

# Backup data folder
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz backend/data/

# Restart services
docker-compose up -d
```

**Backup Named Volume:**

```bash
# Create backup from running container
docker run --rm \
  -v backend-data:/data \
  -v $(pwd):/backup \
  alpine tar -czf /backup/backup.tar.gz /data
```

### Automated Backup Script

**`backend/scripts/backup.sh`:**

**Schedule:** Daily cron job at 2 AM

**Process:**

1. Create tar.gz of data folder
2. Add timestamp to filename
3. Upload to remote storage (S3, Google Drive)
4. Rotate old backups (keep last 30 days)
5. Send notification on failure

**Cron Job:**

```bash
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### Backup Retention

**Local Backups:**

- Keep last 7 daily backups
- Delete backups older than 7 days

**Remote Backups:**

- Keep last 30 daily backups
- Keep 4 weekly backups (last day of week)
- Keep 12 monthly backups (last day of month)

**Storage Requirements:**

- Estimated size: 1-10 MB per backup
- Daily: 7 × 10 MB = 70 MB
- Monthly: 30 × 10 MB = 300 MB
- Total: ~400 MB

## Restore Procedure

### Full Restore

**From Bind Mount (Development):**

```bash
# Stop services
docker-compose down

# Extract backup
tar -xzf backup.tar.gz

# Verify files
ls -lh backend/data/

# Restart services
docker-compose up -d
```

**From Named Volume (Production):**

```bash
# Stop services
docker-compose -f docker-compose.deploy.yml down

# Remove old volume
docker volume rm backend-data

# Restore from backup
docker run --rm \
  -v backend-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "cd /data && tar -xzf /backup/backup.tar.gz --strip 1"

# Restart services
docker-compose -f docker-compose.deploy.yml up -d
```

### Partial Restore

**Restore Single File (settings.json):**

```bash
# Extract specific file from backup
tar -xzf backup.tar.gz backend/data/settings.json

# Copy to running container
docker cp backend/data/settings.json backend-container:/app/data/settings.json

# Restart backend
docker-compose restart backend
```

**Restore Database Only:**

```bash
# Extract users.db
tar -xzf backup.tar.gz backend/data/users.db

# Stop services
docker-compose down

# Copy database
cp backup/users.db backend/data/users.db

# Restart
docker-compose up -d
```

## Data Migration

### SQLite Migration

**Add New Column:**

Database migrations handled manually in `backend/src/database/init.js`

**Process:**

1. Check if column exists
2. If not, run ALTER TABLE command
3. Update application code to use new column

**Example Migration:**

```javascript
// Check if 'email' column exists
const columnCheck = db.prepare("PRAGMA table_info(users)").all();
const hasEmail = columnCheck.some(col => col.name === 'email');

if (!hasEmail) {
  // Add column
  db.exec("ALTER TABLE users ADD COLUMN email TEXT");
}
```

### JSON Data Migration

**Settings Schema Change:**

**Process:**

1. Read existing settings.json
2. Transform data structure
3. Write to new format
4. Keep backup of old format

**Example:** Add new service (Plex)

**Old Format:**

```json
{
  "users": {
    "1": {
      "qbittorrent": {...},
      "jellyfin": {...}
    }
  }
}
```

**New Format:**

```json
{
  "users": {
    "1": {
      "qbittorrent": {...},
      "jellyfin": {...},
      "plex": null
    }
  }
}
```

**Migration Script:**

```javascript
const data = JSON.parse(fs.readFileSync('settings.json'));
for (const userId in data.users) {
  if (!data.users[userId].plex) {
    data.users[userId].plex = null;
  }
}
fs.writeFileSync('settings.json', JSON.stringify(data, null, 2));
```

## Data Rotation

### Search History Rotation

**Max Entries:** 1000

**Rotation Logic:**

```javascript
let history = JSON.parse(fs.readFileSync('search-history.json'));

// Add new entry
history.push(newEntry);

// Rotate if over limit
if (history.length > 1000) {
  // Sort by timestamp
  history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Keep newest 1000
  history = history.slice(0, 1000);
}

fs.writeFileSync('search-history.json', JSON.stringify(history, null, 2));
```

### Logs Rotation

**Max Entries:** 1000

**Rotation Logic:** Same as search history

**External Log Rotation (Future):**

- Use Winston or Bunyan for log management
- Rotate based on file size or date
- Compress old logs
- Archive to long-term storage

## Performance Considerations

### SQLite Performance

**Optimization:**

- Use indexes on frequently queried columns (username)
- Enable WAL mode for better concurrency
- Use prepared statements (reuse query plans)
- Connection pooling (not needed, single connection sufficient)

**WAL Mode:**

```javascript
db.exec("PRAGMA journal_mode = WAL");
```

**Benefits:**

- Readers don't block writers
- Better performance for concurrent access
- Reduced disk I/O

### JSON File Performance

**Current Limitations:**

- Full file read/write on every operation
- Not suitable for high-frequency updates
- Memory usage grows với file size

**Optimizations:**

- Keep files small (rotation)
- Cache in memory (invalidate on write)
- Use database for high-frequency data

**Future Improvements:**

- Move settings to SQLite table
- Move history to SQLite table
- Keep logs in JSON (append-only)

## Data Security

### File Permissions

**Recommended:**

- `users.db` - chmod 600 (owner read/write only)
- `settings.json` - chmod 600 (contains passwords)
- `search-history.json` - chmod 644 (world-readable okay)
- `logs.json` - chmod 644

**Docker User:**

- Run as non-root user (nodejs:nodejs, UID 1001)
- Change file ownership: `chown -R 1001:1001 backend/data`

### Encryption

**Current State:**

- Passwords: bcrypt hashed (one-way)
- JWT tokens: Signed, not encrypted
- Settings: Plain text (passwords stored as-is)

**Future Enhancements:**

- Encrypt settings.json với AES-256
- Use secrets management (Vault, AWS Secrets Manager)
- Encrypt database file (SQLCipher)

### Access Control

**Application-Level:**

- Users can only access own settings (filtered by userId)
- Users can only see own history (filtered by userId)
- Logs are admin-only
- Database queries use prepared statements (SQL injection prevention)

**File-Level:**

- Restrict file permissions (chmod 600)
- Run as non-root user trong Docker
- Volume mounts are read-write (could be read-only for some files)

## Monitoring

### Data Health Checks

**Startup Checks:**

- Verify database file exists and is readable
- Verify users table schema is correct
- Verify JSON files are valid JSON
- Create missing files với defaults

**Runtime Checks:**

- Log database errors
- Log file read/write errors
- Monitor disk space (future)
- Alert on corruption (future)

### Metrics (Future)

**Database Metrics:**

- Query count per minute
- Average query time
- Connection pool size
- Database file size

**File Metrics:**

- File sizes
- Read/write counts
- Error rates
- Rotation frequency

## Disaster Recovery

### Scenarios

**Database Corruption:**

1. Restore from latest backup
2. If no backup, try SQLite recovery tools
3. Last resort: Recreate database, users re-register

**JSON File Corruption:**

1. Restore from latest backup
2. If no backup, parse partial data
3. Reset to default values

**Volume Loss:**

1. Restore from remote backup
2. Verify data integrity
3. Restart services

### Recovery Time Objective (RTO)

**Target:** < 1 hour

**Process:**

1. Detect issue (manual or monitoring)
2. Identify latest valid backup (5 minutes)
3. Restore data (10 minutes)
4. Verify integrity (10 minutes)
5. Restart services (5 minutes)
6. Test functionality (30 minutes)

### Recovery Point Objective (RPO)

**Target:** < 24 hours (daily backups)

**Improvement:** Reduce to < 1 hour với automated backups every hour

## Summary

**Storage:**

- SQLite: User accounts (users.db)
- JSON: Settings, history, logs
- Docker volumes: Persistence across restarts

**Backup:**

- Manual: tar.gz of data folder
- Automated: Daily backups với cron
- Retention: 30 days

**Restore:**

- Full restore: Extract backup, restart services
- Partial restore: Extract specific files
- Verify integrity before restarting

**Security:**

- File permissions (chmod 600/644)
- Non-root Docker user
- Application-level access control
- Future: Encryption for sensitive data

**Performance:**

- SQLite WAL mode
- JSON file rotation (max 1000 entries)
- Future: Move to database for better performance

**Monitoring:**

- Startup health checks
- Runtime error logging
- Future: Metrics and alerting

**Next Steps:**

- [Architecture Overview](../architecture/README.md)
- [Backend Structure](./backend.md)
- [Configuration](./configuration.md)
