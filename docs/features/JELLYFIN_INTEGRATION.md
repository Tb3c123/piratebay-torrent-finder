# Jellyfin Integration Documentation

## Overview

The application now supports full Jellyfin integration, allowing you to connect to your Jellyfin media server to retrieve library information and directory paths. This enables seamless coordination between torrent downloads and your Jellyfin media organization.

## Features Implemented

### Backend API Endpoints

#### 1. Get Jellyfin Settings

```bash
GET /api/settings/jellyfin
```

**Response:**

```json
{
  "success": true,
  "settings": {
    "url": "https://media.homes-enter.xyz",
    "apiKey": ""
  }
}
```

#### 2. Save Jellyfin Settings

```bash
POST /api/settings/jellyfin
Content-Type: application/json

{
  "url": "https://media.homes-enter.xyz",
  "apiKey": ""
}
```

**Response:**

```json
{
  "success": true,
  "message": "Jellyfin settings saved successfully"
}
```

#### 3. Test Jellyfin Connection

```bash
POST /api/settings/jellyfin/test
Content-Type: application/json

{
  "url": "https://media.homes-enter.xyz",
  "apiKey": ""
}
```

**Response:**

```json
{
  "success": true,
  "message": "Connection successful!",
  "serverName": "jellyfin",
  "version": "10.10.7",
  "libraries": [
    {
      "id": "f137a2dd21bbc1b99aa5c0f6bf02a805",
      "name": "Movies",
      "type": "movies",
      "paths": ["/Jellyfin/Movies"]
    },
    {
      "id": "a656b907eb3a73532e40e44b968d0225",
      "name": "Shows",
      "type": "tvshows",
      "paths": ["/Jellyfin/Shows"]
    }
  ]
}
```

#### 4. Get Libraries (from saved settings)

```bash
GET /api/settings/jellyfin/libraries
```

**Response:**

```json
{
  "success": true,
  "libraries": [...]
}
```

## Frontend Settings UI

### Location

Navigate to: **Settings** (via Burger Menu) → **Jellyfin Connection** section

### Features

1. **Server URL Input**
   - Enter your Jellyfin server URL
   - Validates URL format (must start with http:// or https://)
   - Example: `https://media.homes-enter.xyz`

2. **API Key Input**
   - Enter your Jellyfin API key
   - Monospaced font for easy reading
   - Example: ``

3. **Test Connection Button**
   - Tests connection without saving
   - Displays server info on success
   - Shows all available libraries with their paths
   - Color-coded feedback (green=success, red=error)

4. **Save Settings Button**
   - Persists settings to backend
   - Updates settings.json file

5. **Library Display**
   - Shows library name and type (movies/tvshows)
   - Displays full filesystem paths
   - Helps identify where to download torrents

## Verified Test Results

### Test Server Configuration

- **Server URL:** `https://media.homes-enter.xyz`
- **API Key:** ``
- **Server Name:** jellyfin
- **Version:** 10.10.7

### Available Libraries

| Library Name | Type | Path |
|-------------|------|------|
| Cartoon | tvshows | `/Jellyfin/Cartoon` |
| MCU | movies | `/Jellyfin/MCU` |
| Anime | tvshows | `/Jellyfin/Anime` |
| DC | movies | `/Jellyfin/DC` |
| Tokusatsu | tvshows | `/Jellyfin/Tokusatsu` |
| Movies | movies | `/Jellyfin/Movies` |
| Shows | tvshows | `/Jellyfin/Shows` |

### Test Commands

```bash
# Test connection
curl -X POST http://localhost:3001/api/settings/jellyfin/test \
  -H "Content-Type: application/json" \
  -d '{"url":"https://media.homes-enter.xyz","apiKey":""}'

# Save settings
curl -X POST http://localhost:3001/api/settings/jellyfin \
  -H "Content-Type: application/json" \
  -d '{"url":"https://media.homes-enter.xyz","apiKey":""}'

# Get saved settings
curl http://localhost:3001/api/settings/jellyfin

# Get libraries from saved settings
curl http://localhost:3001/api/settings/jellyfin/libraries
```

## How to Get Your Jellyfin API Key

1. Log in to your Jellyfin web interface
2. Go to **Dashboard** (click the hamburger menu)
3. Navigate to **Advanced** → **API Keys**
4. Click **+ (Add API Key)**
5. Enter an app name (e.g., "Pirate Bay Torrent Finder")
6. Copy the generated API key

## Integration Use Cases

### 1. Smart Download Path Selection

When downloading torrents, you can:

- See available Jellyfin libraries
- Choose appropriate library path
- Download directly to correct media folder
- Jellyfin auto-detects new content

### 2. Library Organization

- **Movies**: Use `/Jellyfin/Movies` or specialized libraries (MCU, DC)
- **TV Shows**: Use `/Jellyfin/Shows`, `/Jellyfin/Anime`, `/Jellyfin/Cartoon`
- **Tokusatsu**: Special library for Japanese live-action series

### 3. Future Enhancements

Potential features that can leverage this integration:

- Auto-select download path based on media type
- Trigger Jellyfin library scan after download
- Check if media already exists in Jellyfin
- Import Jellyfin metadata to enhance search

## Settings File Structure

**Location:** `backend/src/data/settings.json`

```json
{
  "qbittorrent": {
    "url": "https://torrent.homes-enter.xyz",
    "username": "admin",
    "password": "Hieu1234@"
  },
  "jellyfin": {
    "url": "https://media.homes-enter.xyz",
    "apiKey": ""
  }
}
```

## Error Handling

The integration handles various error scenarios:

| Error | Message | Cause |
|-------|---------|-------|
| ECONNREFUSED | Connection refused. Check if Jellyfin is running... | Server not running or wrong URL |
| ETIMEDOUT | Connection timeout. Check URL and network... | Network issues or firewall |
| 401 | Unauthorized. Check your API key. | Invalid or expired API key |
| 403 | Access forbidden. Check API key permissions. | API key lacks required permissions |

## Security Notes

- API keys are stored in plain text in `settings.json`
- Consider encrypting sensitive data in production
- API keys have full access to Jellyfin - keep them secure
- Settings file should not be committed to version control

## Browser Usage

1. Open application: `http://localhost:3000`
2. Click **Burger Menu** (top-left)
3. Click **Settings** ⚙️
4. Scroll to **Jellyfin Connection** section
5. Enter your Jellyfin server URL
6. Enter your API key
7. Click **Test Connection** to verify
8. Review available libraries and paths
9. Click **Save Settings** to persist

## API Integration Details

### Jellyfin API Version

Uses Jellyfin API with `X-Emby-Token` header authentication (compatible with both Jellyfin and Emby)

### Endpoints Called

- `GET /System/Info` - Get server information
- `GET /Library/VirtualFolders` - Get media libraries

### Response Processing

- Extracts library ID, name, type, and filesystem paths
- Maps `CollectionType` to determine media type
- Filters and organizes libraries for display

## Next Steps

Potential enhancements:

- [ ] Add library refresh/scan trigger after torrent completion
- [ ] Check existing content before downloading duplicates
- [ ] Auto-map movie/show names to Jellyfin items
- [ ] Display recently added items from Jellyfin
- [ ] Support multiple Jellyfin servers
- [ ] Add webhook notifications to Jellyfin
- [ ] Import Jellyfin watch history
- [ ] Sync download queue with Jellyfin requests

## Troubleshooting

### Connection Test Fails

1. Verify Jellyfin is running: `curl https://media.homes-enter.xyz/System/Info`
2. Check API key is valid in Jellyfin Dashboard
3. Ensure firewall allows connections
4. Verify URL format (include https://)

### No Libraries Shown

1. Check if libraries are configured in Jellyfin
2. Verify API key has permission to read libraries
3. Check Jellyfin logs for errors

### Paths Not Displayed

- Some libraries may not have filesystem paths configured
- Check library settings in Jellyfin Dashboard

## Summary

✅ **Completed:**

- Jellyfin settings backend API (GET, POST, TEST)
- Frontend UI with form validation
- Connection testing with library discovery
- Path information retrieval
- Settings persistence
- Comprehensive error handling

✅ **Verified:**

- Connection to `https://media.homes-enter.xyz` successful
- Retrieved 7 libraries (Movies, Shows, Anime, Cartoon, MCU, DC, Tokusatsu)
- All library paths correctly displayed
- Settings saved and retrievable

Your Jellyfin server is now fully integrated with the Pirate Bay Torrent Finder! 🎉
