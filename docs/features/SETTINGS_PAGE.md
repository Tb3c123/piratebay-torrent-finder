# Settings Feature Documentation

## Overview

A new Settings page has been added to configure qBittorrent connection settings, accessible from the Burger Menu.

## What Was Implemented

### 1. Frontend Settings Page (`/settings`)

**Location:** `frontend/src/app/settings/page.tsx`

**Features:**

- ✅ Form to configure qBittorrent server URL, username, and password
- ✅ Real-time validation for required fields and URL format
- ✅ "Test Connection" button to verify credentials before saving
- ✅ "Save Settings" button to persist configuration
- ✅ Visual feedback for connection test results (success/failure)
- ✅ Responsive design matching the app's dark theme
- ✅ Back button to return to previous page
- ✅ Helpful tips section for troubleshooting

### 2. Backend Settings API

**Location:** `backend/src/routes/settings.js`

**Endpoints:**

- `GET /api/settings/qbittorrent` - Retrieve current qBittorrent settings
- `POST /api/settings/qbittorrent` - Save qBittorrent settings
- `POST /api/settings/qbittorrent/test` - Test qBittorrent connection without saving

**Features:**

- ✅ Settings persisted to `backend/src/data/settings.json`
- ✅ Validation for required fields and URL format
- ✅ Comprehensive error handling with descriptive messages
- ✅ Connection testing with timeout handling
- ✅ Automatic fallback to environment variables if settings file doesn't exist

### 3. Updated qBittorrent Service

**Location:** `backend/src/services/qbittorrent.js`

**Changes:**

- ✅ Now reads settings from `settings.json` file instead of only environment variables
- ✅ Dynamic configuration loading for each API call
- ✅ Maintains backward compatibility with environment variables as fallback

### 4. Burger Menu Integration

**Location:** `frontend/src/components/BurgerMenu/MainView.tsx`

**Changes:**

- ✅ Replaced disabled "Settings (Coming Soon)" with active Settings button
- ✅ Added navigation to `/settings` page
- ✅ Visual styling consistent with System Logs section

## How to Use

### Accessing Settings

1. Open the Burger Menu (top-left corner)
2. Click on the "Settings" button with the ⚙️ icon
3. You'll be redirected to `/settings` page

### Configuring qBittorrent

1. Enter your qBittorrent server URL (e.g., `https://torrent.homes-enter.xyz`)
2. Enter your username (e.g., `admin`)
3. Enter your password
4. Click "Test Connection" to verify the credentials work
5. If test succeeds, click "Save Settings" to persist the configuration

### Testing

The settings API has been tested and verified:

```bash
# Test connection (returns success/failure without saving)
curl -X POST http://localhost:3001/api/settings/qbittorrent/test \
  -H "Content-Type: application/json" \
  -d '{"url":"https://torrent.homes-enter.xyz","username":"admin","password":"Hieu1234@"}'

# Save settings
curl -X POST http://localhost:3001/api/settings/qbittorrent \
  -H "Content-Type: application/json" \
  -d '{"url":"https://torrent.homes-enter.xyz","username":"admin","password":"Hieu1234@"}'

# Retrieve current settings
curl http://localhost:3001/api/settings/qbittorrent
```

**Verified Results:**

- ✅ Connection test to `https://torrent.homes-enter.xyz` with admin credentials: **SUCCESS**
- ✅ Settings saved successfully to `settings.json`
- ✅ Settings retrieved correctly from API

## File Structure

```text
backend/
├── src/
│   ├── data/
│   │   └── settings.json          # Persisted settings file
│   ├── routes/
│   │   └── settings.js            # Settings API endpoints (NEW)
│   ├── services/
│   │   └── qbittorrent.js         # Updated to read from settings.json
│   └── index.js                   # Added settings routes

frontend/
├── src/
│   ├── app/
│   │   └── settings/
│   │       └── page.tsx           # Settings page UI (NEW)
│   └── components/
│       ├── BurgerMenu.tsx         # Added settings navigation
│       └── BurgerMenu/
│           └── MainView.tsx       # Enabled settings button
```

## Settings File Format

**Location:** `backend/src/data/settings.json`

```json
{
  "qbittorrent": {
    "url": "https://torrent.homes-enter.xyz",
    "username": "admin",
    "password": "Hieu1234@"
  }
}
```

## Error Handling

The settings page handles various error scenarios:

1. **Invalid URL format** - Shows error message if URL doesn't start with http:// or https://
2. **Missing required fields** - Highlights fields with validation errors
3. **Connection timeout** - Shows descriptive error message
4. **Connection refused** - Suggests checking if qBittorrent is running
5. **Invalid credentials** - Returns 403 error with appropriate message

## Security Considerations

- Passwords are stored in plain text in `settings.json` (consider encrypting in production)
- The settings file is on the backend, not exposed to frontend
- API endpoints should be protected in production (add authentication)

## Future Enhancements

Potential improvements:

- [ ] Add password encryption/hashing
- [ ] Add authentication for settings endpoints
- [ ] Support for multiple qBittorrent instances
- [ ] Add save path configuration
- [ ] Add category/tag settings
- [ ] Import/export settings feature
- [ ] Settings backup/restore functionality

## Testing in Docker

Both backend and frontend containers have been rebuilt and restarted with the new code:

```bash
# Rebuild and restart backend
docker-compose build backend
docker-compose up -d backend

# Rebuild and restart frontend
docker-compose build frontend
docker-compose up -d frontend
```

## Browser Testing

Visit <http://localhost:3000> and:

1. Click the burger menu
2. Click "Settings"
3. Enter your qBittorrent credentials
4. Test the connection
5. Save the settings

Your qBittorrent server at <https://torrent.homes-enter.xyz> is now configured and ready to use!
