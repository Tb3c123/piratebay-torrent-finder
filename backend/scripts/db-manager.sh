#!/bin/bash

# Database Manager Script for Pirate Bay Torrent Finder
# Provides easy access to SQLite database in Docker container

CONTAINER_NAME="piratebay-backend"
DB_PATH="/app/data/users.db"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}Error: Container '$CONTAINER_NAME' is not running${NC}"
        exit 1
    fi
}

# Ensure sqlite3 is installed in container
ensure_sqlite() {
    if ! docker exec "$CONTAINER_NAME" which sqlite3 > /dev/null 2>&1; then
        echo -e "${YELLOW}Installing sqlite3 in container...${NC}"
        docker exec "$CONTAINER_NAME" apk add --no-cache sqlite > /dev/null 2>&1
        echo -e "${GREEN}✓ sqlite3 installed${NC}"
    fi
}

# Show help
show_help() {
    echo -e "${BLUE}=== Database Manager ===${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  shell              - Open interactive SQLite shell"
    echo "  users              - List all users"
    echo "  admin              - Show admin user"
    echo "  credentials [id]   - Show credentials for user (default: all)"
    echo "  sessions           - Show active sessions"
    echo "  stats              - Show database statistics"
    echo "  schema             - Show database schema"
    echo "  backup             - Backup database to local file"
    echo "  help               - Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 users                    # List all users"
    echo "  $0 credentials 1            # Show credentials for user ID 1"
    echo "  $0 shell                    # Open interactive shell"
}

# Open interactive SQLite shell
open_shell() {
    echo -e "${GREEN}Opening SQLite shell...${NC}"
    echo -e "${YELLOW}Commands: .tables, .schema, .exit${NC}"
    docker exec -it "$CONTAINER_NAME" sqlite3 "$DB_PATH"
}

# List all users
list_users() {
    echo -e "${GREEN}=== All Users ===${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT
            id as ID,
            username as Username,
            CASE WHEN is_admin = 1 THEN 'Yes' ELSE 'No' END as Admin,
            created_at as 'Created At'
        FROM users;" \
        -header -column
}

# Show admin user
show_admin() {
    echo -e "${GREEN}=== Admin User ===${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT id, username, created_at FROM users WHERE is_admin = 1;" \
        -header -column
}

# Show credentials
show_credentials() {
    local user_id=$1
    echo -e "${GREEN}=== User Credentials ===${NC}"

    if [ -z "$user_id" ]; then
        # Show all
        docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
            "SELECT
                c.id,
                c.user_id,
                u.username,
                c.omdb_api_key,
                c.qbt_host,
                c.qbt_username,
                c.jellyfin_host
            FROM user_credentials c
            JOIN users u ON c.user_id = u.id;" \
            -header -column
    else
        # Show specific user
        docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
            "SELECT
                c.id,
                c.user_id,
                u.username,
                c.omdb_api_key,
                c.qbt_host,
                c.qbt_username,
                c.jellyfin_host
            FROM user_credentials c
            JOIN users u ON c.user_id = u.id
            WHERE c.user_id = $user_id;" \
            -header -column
    fi
}

# Show active sessions
show_sessions() {
    echo -e "${GREEN}=== Active Sessions ===${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT
            s.id,
            s.user_id,
            u.username,
            substr(s.token, 1, 30) || '...' as token,
            s.expires_at,
            s.created_at
        FROM sessions s
        JOIN users u ON s.user_id = u.id
        WHERE s.expires_at > datetime('now');" \
        -header -column
}

# Show database statistics
show_stats() {
    echo -e "${GREEN}=== Database Statistics ===${NC}"

    echo -e "\n${BLUE}Users:${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT COUNT(*) as 'Total Users' FROM users;"

    echo -e "\n${BLUE}Admin Users:${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT COUNT(*) as 'Admin Users' FROM users WHERE is_admin = 1;"

    echo -e "\n${BLUE}Active Sessions:${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" \
        "SELECT COUNT(*) as 'Active Sessions' FROM sessions WHERE expires_at > datetime('now');"

    echo -e "\n${BLUE}Database Size:${NC}"
    docker exec "$CONTAINER_NAME" sh -c "ls -lh $DB_PATH | awk '{print \$5}'"
}

# Show schema
show_schema() {
    echo -e "${GREEN}=== Database Schema ===${NC}"
    docker exec "$CONTAINER_NAME" sqlite3 "$DB_PATH" ".schema"
}

# Backup database
backup_db() {
    local backup_file="users_backup_$(date +%Y%m%d_%H%M%S).db"
    echo -e "${GREEN}Backing up database to: $backup_file${NC}"

    docker cp "$CONTAINER_NAME:$DB_PATH" "./$backup_file"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backup successful: $backup_file${NC}"
    else
        echo -e "${RED}✗ Backup failed${NC}"
        exit 1
    fi
}

# Main script
check_container
ensure_sqlite

case "$1" in
    shell)
        open_shell
        ;;
    users)
        list_users
        ;;
    admin)
        show_admin
        ;;
    credentials)
        show_credentials "$2"
        ;;
    sessions)
        show_sessions
        ;;
    stats)
        show_stats
        ;;
    schema)
        show_schema
        ;;
    backup)
        backup_db
        ;;
    help|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
