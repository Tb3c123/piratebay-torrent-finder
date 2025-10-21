# Database Management Scripts

This directory contains utility scripts for managing the application database.

## db-manager.sh

A comprehensive shell script for managing the SQLite database in the Docker container.

### Features

- **Interactive SQLite Shell**: Direct access to database
- **User Management**: List, view, and manage users
- **Credentials Viewer**: View API credentials per user
- **Session Management**: View active user sessions
- **Statistics**: Database and user statistics
- **Backup**: Create database backups

### Usage

```bash
# Make script executable (first time only)
chmod +x backend/scripts/db-manager.sh

# Show help
./backend/scripts/db-manager.sh help

# List all users
./backend/scripts/db-manager.sh users

# Show admin user
./backend/scripts/db-manager.sh admin

# Show all credentials
./backend/scripts/db-manager.sh credentials

# Show credentials for specific user
./backend/scripts/db-manager.sh credentials 1

# View active sessions
./backend/scripts/db-manager.sh sessions

# Show database statistics
./backend/scripts/db-manager.sh stats

# Show database schema
./backend/scripts/db-manager.sh schema

# Open interactive SQLite shell
./backend/scripts/db-manager.sh shell

# Backup database
./backend/scripts/db-manager.sh backup
```

### Interactive Shell Commands

When in the SQLite shell (`.backend/scripts/db-manager.sh shell`):

```text
-- Show all tables
.tables

-- Show schema
.schema

-- Query users
SELECT * FROM users;

-- Query credentials
SELECT * FROM user_credentials;

-- Exit
.exit
```

### Requirements

- Docker container `piratebay-backend` must be running
- Script automatically installs `sqlite3` in container if needed

### Database Location

- **In Container**: `/app/data/users.db`
- **Local Backup**: `./users_backup_YYYYMMDD_HHMMSS.db`

## Admin System

### First User is Admin

The first user registered after Docker startup automatically becomes the admin:

```bash
# Register first user (becomes admin)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_secure_password"}'
```

### Admin Capabilities

Admin users can:

- View all users: `GET /api/auth/admin/users`
- Delete users: `DELETE /api/auth/admin/users/:userId`
- Cannot delete themselves (user ID 1)

### API Examples

```bash
# Login as admin
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}' \
  | jq -r '.token')

# View all users (admin only)
curl -s http://localhost:3001/api/auth/admin/users \
  -H "Authorization: Bearer $TOKEN" | jq .

# Delete a user (admin only)
curl -s -X DELETE http://localhost:3001/api/auth/admin/users/2 \
  -H "Authorization: Bearer $TOKEN" | jq .
```
