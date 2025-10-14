# Environment Setup - Centralized Configuration

## Quick Start

All environment variables are now in **one centralized `.env` file** at the project root.

```bash
# Copy template
cp .env.example .env

# Edit your settings
nano .env

# Start application
docker-compose up -d
```

## What's New?

### Before (Old way - still works!)

```
/.env                 # Docker Compose variables
/backend/.env         # Backend variables
/frontend/.env        # Frontend variables
```

### After (New way - recommended!)

```
/.env                 # ALL variables in one place! ✅
```

## Migration from Old Setup

If you already have `backend/.env` and `frontend/.env`:

**Option 1: Use centralized .env (recommended)**

```bash
# Create new centralized .env
cp .env.example .env

# Copy your values from backend/.env and frontend/.env to root .env
nano .env

# Optional: Keep or delete old files (they still work as fallback)
```

**Option 2: Keep old setup (still works!)**

```bash
# No changes needed - backend/.env and frontend/.env still work
# Docker will use variables from those files
```

## Configuration Reference

### Root `.env` File Structure

```bash
# ============================================
# BACKEND CONFIGURATION
# ============================================
PORT=3001
OMDB_API_KEY=3d5cd52a
QBITTORRENT_URL=http://localhost:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminadmin
PIRATEBAY_URL=https://thepiratebay.org

# ============================================
# FRONTEND CONFIGURATION
# ============================================
NEXT_PUBLIC_API_URL=http://localhost:3001

# ============================================
# DOCKER CONFIGURATION
# ============================================
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

## Benefits of Centralized .env

✅ **One file** instead of three
✅ **Easier setup** for new installations
✅ **All variables** in one place
✅ **Port configuration** (NEW!) - easily change ports
✅ **Better organized** with clear sections
✅ **Backward compatible** - old setup still works

## How It Works

1. **Edit root `.env` file** with your configuration
2. **Docker Compose reads variables** using `${VAR:-default}` syntax
3. **Specific variables passed** to each service via `environment:` section
4. **No env_file loading** - prevents variable conflicts between services

### Important Note

We intentionally **do NOT use `env_file: - .env`** in docker-compose.yml because it would load ALL variables into each container, causing conflicts. For example, backend's `PORT=3001` would conflict with frontend's internal port.

Instead, we:

- Keep all variables in root `.env` for easy editing
- Let Docker Compose read them via shell expansion
- Pass only specific variables to each service

## Port Configuration (NEW!)

You can now easily change ports without editing docker-compose.yml:

```bash
# In .env
FRONTEND_PORT=8000
BACKEND_PORT=8001
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Troubleshooting

### Variables not loading?

```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Frontend can't connect to backend?

Check `NEXT_PUBLIC_API_URL` in `.env`:

- For local: `http://localhost:3001`
- For Docker internal: `http://backend:3001`

### Port already in use?

Change ports in `.env`:

```bash
FRONTEND_PORT=8000
BACKEND_PORT=8001
```

## Need Help?

See the main [README.md](README.md) for full documentation.
