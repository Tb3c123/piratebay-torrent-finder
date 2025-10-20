# Download with Jellyfin Folder Selection

## Overview

This feature adds a download popup modal that allows users to select which Jellyfin library folder to download torrents to when using qBittorrent.

## Features

- **Folder Selection**: Choose from configured Jellyfin libraries when downloading
- **Visual Library Display**: Shows library name, type (Movies/TV Shows), and path
- **Unified Experience**: Same popup works for both "Download" and "Download with qBittorrent" buttons
- **Smart Path Handling**: Displays friendly library names but sends actual paths to qBittorrent

## Components

### DownloadModal Component

**Location**: `/frontend/src/components/DownloadModal.tsx`

**Props**:

```typescript
interface DownloadModalProps {
    isOpen: boolean
    onClose: () => void
    magnetLink: string
    torrentName?: string
    onDownloadStart?: () => void
}
```

**Features**:

- Loads Jellyfin libraries from backend API
- Radio-style library selection with visual indicators
- Shows library icons based on type (🎬 Movies, 📺 TV Shows, 📁 Other)
- Loading states and error handling
- Responsive design with Tailwind CSS

**API Integration**:

- GET `/api/settings/jellyfin/saved-libraries` - Fetch libraries
- POST `/api/qbittorrent/add` - Start download with selected path

## Integration Points

### 1. TorrentList Component

**Location**: `/frontend/src/components/torrent/TorrentList.tsx`

**Changes**:

- Added DownloadModal state management
- Modified `handleDownload` to open modal instead of direct download
- Modal triggers on "Download" button click

**Usage**:

```typescript
<button onClick={() => handleDownload(torrent.magnetLink, torrent.title)}>
    ⬇️ Download
</button>
```

### 2. Torrent Detail Page

**Location**: `/frontend/src/app/torrent/[id]/page.tsx`

**Changes**:

- Added DownloadModal state management
- Simplified `handleDownload` to open modal
- Modal triggers on "Download with qBittorrent" button click
- Callback redirects to logs page on success

**Usage**:

```typescript
<button onClick={handleDownload}>
    ⬇️ Download with qBittorrent
</button>
```

## User Flow

### Step 1: Trigger Download

User clicks either:

- "Download" button in torrent list
- "Download with qBittorrent" button in torrent details

### Step 2: Select Folder

Modal appears showing:

- List of configured Jellyfin libraries
- Each library shows: Icon, Name, Type, Path
- First library auto-selected

### Step 3: Confirm Download

User can:

- Change library selection
- Click "Start Download" to begin
- Click "Cancel" to abort

### Step 4: Download Starts

- qBittorrent receives magnet link with savePath
- Success message displays with library name
- Modal closes automatically
- (Detail page only) Redirects to logs page

## Configuration Required

### 1. Configure Jellyfin

Navigate to Settings page and:

1. Enter Jellyfin server URL
2. Enter Jellyfin API key
3. Click "Test Connection"
4. Click "Save & Fetch Libraries"

### 2. Configure qBittorrent

Ensure qBittorrent settings are configured with:

- Server URL
- Username and password
- Web UI enabled

## Library Data Structure

Libraries are stored in `backend/src/data/settings.json`:

```json
{
    "jellyfin": {
        "url": "https://media.homes-enter.xyz",
        "apiKey": "your-api-key",
        "libraries": [
            {
                "id": "abc123",
                "name": "Movies",
                "type": "movies",
                "paths": ["/Jellyfin/Movies"]
            },
            {
                "id": "def456",
                "name": "TV Shows",
                "type": "tvshows",
                "paths": ["/Jellyfin/Shows"]
            }
        ]
    }
}
```

## API Endpoints Used

### Get Saved Libraries

```bash
GET /api/settings/jellyfin/saved-libraries
```

**Response**:

```json
{
    "success": true,
    "libraries": [
        {
            "id": "abc123",
            "name": "Movies",
            "type": "movies",
            "paths": ["/Jellyfin/Movies"]
        }
    ]
}
```

### Add Torrent with Path

```bash
POST /api/qbittorrent/add
Content-Type: application/json

{
    "magnetLink": "magnet:?xt=...",
    "savePath": "/Jellyfin/Movies"
}
```

**Response**:

```json
{
    "success": true,
    "message": "Torrent added to qBittorrent"
}
```

## Error Handling

### No Libraries Configured

If no Jellyfin libraries are found:

- Modal shows warning message
- "Configure Jellyfin" button redirects to Settings
- Download cannot proceed

### Download Fails

If qBittorrent fails:

- Error message displays in modal
- User can retry or check qBittorrent settings
- Modal remains open for correction

### API Errors

All API errors are caught and displayed:

- Connection errors
- Authentication failures
- Invalid paths

## Styling

### Modal Design

- Dark theme matching app design (gray-800 background)
- Blue accent color for selected library
- Green "Start Download" button
- Overlay with 75% opacity black background

### Library Cards

- Clickable cards with hover effects
- Border changes on selection (gray → blue)
- Icons for visual identification
- Truncated paths in monospace font
- Checkmark indicator for selected library

### Responsive Design

- Mobile-friendly layout
- Max height with scroll for many libraries
- Touch-friendly tap targets
- Proper spacing and padding

## Testing

### Manual Testing Checklist

1. ✅ Configure Jellyfin and fetch libraries
2. ✅ Click Download button in torrent list
3. ✅ Modal appears with libraries
4. ✅ Select different library
5. ✅ Confirm selection updates visually
6. ✅ Click "Start Download"
7. ✅ Success message appears
8. ✅ Check qBittorrent for download in correct folder
9. ✅ Repeat for "Download with qBittorrent" button

### Test Cases

- Download with Movies library
- Download with TV Shows library
- Download with custom library
- Cancel download
- No libraries configured
- Network error during download
- Invalid magnet link

## Future Enhancements

### Possible Improvements

1. **Remember Last Selection**: Save user's last library choice
2. **Auto-Match Type**: Auto-select Movies for movies, TV Shows for shows
3. **Create Subfolder**: Option to create year/genre subfolders
4. **Download Queue**: Show pending downloads in modal
5. **Path Validation**: Verify paths exist before download
6. **Category Tags**: Apply qBittorrent categories based on library type
7. **Speed Limits**: Set download speed per library
8. **Completion Actions**: Auto-organize files on completion

## Technical Notes

### Why Not Direct Download?

The previous direct download didn't allow folder selection, causing:

- All downloads to default qBittorrent location
- Manual file organization required
- No integration with Jellyfin library structure

### Why Modal vs Page?

Modal chosen for:

- Faster user flow (no page navigation)
- Context preservation (stay on current page)
- Better mobile experience
- Less disruptive

### Performance

- Libraries cached in backend (no repeated Jellyfin API calls)
- Modal lazy-loads libraries only when opened
- Minimal re-renders with React state management

## Related Documentation

- [Jellyfin Integration](./JELLYFIN_INTEGRATION.md)
- [qBittorrent Integration](../README.md)
- [Settings Page](../components/UI_UNIFICATION.md)
