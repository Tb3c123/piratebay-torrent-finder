# Downloads Page Control Functions Fix

## Issue

The pause, resume, and delete functions in the Downloads page were not working. API calls were returning errors:

- `Failed to pause torrent`
- `Failed to resume torrent`

## Root Cause

The qBittorrent server (v5.1.2, API v2.11.4) at `https://torrent.homes-enter.xyz` was returning HTTP 404 for the `/api/v2/torrents/pause` and `/api/v2/torrents/resume` endpoints.

After investigation, it was discovered that this qBittorrent instance uses **different endpoint names**:

- ❌ `/api/v2/torrents/pause` → Returns 404
- ✅ `/api/v2/torrents/stop` → Returns 200
- ❌ `/api/v2/torrents/resume` → Returns 404
- ✅ `/api/v2/torrents/start` → Returns 200

This could be due to:

1. Reverse proxy configuration blocking certain endpoints
2. qBittorrent version differences
3. Custom qBittorrent build with renamed endpoints

## Solution

Updated `/backend/src/services/qbittorrent.js` to use the correct endpoints:

### Before

```javascript
async function pauseTorrent(hash) {
    const response = await axios.post(
        `${config.url}/api/v2/torrents/pause`,
        new URLSearchParams({ hashes: hash }),
        // ...
    );
}

async function resumeTorrent(hash) {
    const response = await axios.post(
        `${config.url}/api/v2/torrents/resume`,
        new URLSearchParams({ hashes: hash }),
        // ...
    );
}
```

### After

```javascript
async function pauseTorrent(hash) {
    const response = await axios.post(
        `${config.url}/api/v2/torrents/stop`,  // Changed from 'pause' to 'stop'
        new URLSearchParams({ hashes: hash }),
        // ...
    );
}

async function resumeTorrent(hash) {
    const response = await axios.post(
        `${config.url}/api/v2/torrents/start`,  // Changed from 'resume' to 'start'
        new URLSearchParams({ hashes: hash }),
        // ...
    );
}
```

## Testing Process

1. **Direct API Testing**: Used curl to test qBittorrent API endpoints directly

   ```bash
   # Test pause (404)
   curl -X POST "https://torrent.homes-enter.xyz/api/v2/torrents/pause" \
     --data "hashes=dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c" \
     -b cookies.txt
   # Returns: HTTP/2 404

   # Test stop (200)
   curl -X POST "https://torrent.homes-enter.xyz/api/v2/torrents/stop" \
     --data "hashes=dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c" \
     -b cookies.txt
   # Returns: HTTP/2 200
   ```

2. **State Verification**: Confirmed torrent state changes
   - Initial state: `stalledUP` (seeding, stalled)
   - After `/stop`: `stoppedUP` (stopped)
   - After `/start`: `stalledUP` (resumed seeding)

3. **Backend API Testing**: Tested through our API

   ```bash
   # Test stop/pause
   curl -X POST "http://localhost:3001/api/qbittorrent/pause/dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c"
   # Returns: {"success":true,"message":"Torrent paused"}

   # Test start/resume
   curl -X POST "http://localhost:3001/api/qbittorrent/resume/dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c"
   # Returns: {"success":true,"message":"Torrent resumed"}

   # Test delete
   curl -X DELETE "http://localhost:3001/api/qbittorrent/delete/dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c?deleteFiles=false"
   # Returns: {"success":true,"message":"Torrent deleted"}
   ```

## Additional Fixes Applied

1. **Added `validateStatus: () => true`** to axios configuration
   - Allows handling of qBittorrent API responses that return empty body with 200 status
   - Manual status code validation added after response

2. **Enhanced Logging**
   - Added debug logs for request parameters
   - Added response status and data logging
   - Added error response logging

## Current Status

✅ **All control functions working**:

- Pause/Stop torrent: Working
- Resume/Start torrent: Working
- Delete torrent (with/without files): Working
- Auto-refresh: Working (3-second interval)

## Files Modified

- `/backend/src/services/qbittorrent.js`
  - Changed `pauseTorrent()` to use `/stop` endpoint
  - Changed `resumeTorrent()` to use `/start` endpoint
  - Added `validateStatus` to all control functions
  - Enhanced logging for debugging

## Notes

- Function names remain `pauseTorrent()` and `resumeTorrent()` for consistency with the rest of the codebase
- The API endpoints are now `/stop` and `/start` internally
- Frontend UI still shows "Pause" and "Resume" buttons (user-facing terminology)
- Settings need to be re-applied after container rebuild (stored in `backend/src/data/settings.json`)

## Testing with Big Buck Bunny

Test torrent used: Big Buck Bunny

- Magnet: `magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny`
- Hash: `dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c`
- Size: 276.4 MB
- Save path: `/Jellyfin/Movies`

## qBittorrent Server Info

- URL: `https://torrent.homes-enter.xyz`
- Version: v5.1.2
- API Version: 2.11.4
- Web UI Port: 8080 (behind reverse proxy)
- Credentials: admin/Hieu1234@
