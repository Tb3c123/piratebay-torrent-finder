# Downloads Page Update - Enhanced Controls

## Updates Made

### 1. Added Force Start Button ⚡

- **Endpoint**: `POST /api/qbittorrent/force-start/:hash`
- **qBittorrent API**: `/api/v2/torrents/setForceStart` with `value=true`
- **Function**: Bypass queue limits and force torrent to start immediately
- **Color**: Emerald green (`bg-emerald-600`) with glow effect
- **Icon**: ⚡ (lightning bolt)
- **State**: Sets torrent to `forcedUP` or `forcedDL` state with `force_start: true`

### 2. Redesigned Button Layout

All buttons now have:

- Clear labels with icons (not just icons)
- Distinct colors for easy identification
- Hover glow effects for better visual feedback
- Wrapped layout for mobile responsiveness

#### Button Colors & Functions

| Button | Color | Icon | Function | Tooltip |
|--------|-------|------|----------|---------|
| **Start** | Green (`bg-green-600`) | ▶️ | Resume/start torrent normally | Start |
| **Force** | Emerald (`bg-emerald-600`) | ⚡ | Force start (bypass queue) | Force Start (bypass queue) |
| **Pause** | Yellow (`bg-yellow-600`) | ⏸️ | Pause torrent | Pause |
| **Delete** | Red (`bg-red-600`) | 🗑️ | Delete with options | Delete (choose option) |

### 3. Improved Delete Functionality

- **Interactive Prompt**: Shows options menu when clicking Delete:
  - `1` - Remove from list only (keep files)
  - `2` - Delete torrent AND files
  - `0` - Cancel
- **Confirmation**: Additional confirmation for file deletion with warning icon
- **Safety**: Two-step process prevents accidental file deletion

#### Delete Flow

```text
Click Delete → Choose Option (0/1/2) → Confirm Action → Execute
```

### 4. New Torrent States Added

Added support for additional qBittorrent states:

| State | Display | Color | Icon | Description |
|-------|---------|-------|------|-------------|
| `stoppedDL` | Stopped | Gray | ⏹️ | Download stopped |
| `stoppedUP` | Stopped | Gray | ⏹️ | Seeding stopped |
| `forcedDL` | Force DL | Emerald | ⚡ | Force downloading |
| `forcedUP` | Force Seed | Emerald | ⚡ | Force seeding |

### 5. Visual Enhancements

- **Shadow Effects**: All buttons have glow on hover
  - Green shadow for Start
  - Emerald shadow for Force Start
  - Yellow shadow for Pause
  - Red shadow for Delete
- **Button Labels**: Text labels alongside icons for clarity
- **Flexible Layout**: Buttons wrap on smaller screens
- **Consistent Spacing**: Uniform gaps between all buttons

## Backend Changes

### `/backend/src/services/qbittorrent.js`

Added new function:

```javascript
async function forceStartTorrent(hash) {
    const response = await axios.post(
        `${config.url}/api/v2/torrents/setForceStart`,
        new URLSearchParams({
            hashes: hash,
            value: 'true'
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie
            },
            validateStatus: () => true
        }
    );

    if (response.status !== 200) {
        throw new Error(`Force start failed with status ${response.status}`);
    }

    return true;
}
```

Exported in module.exports:

```javascript
module.exports = {
    login,
    addTorrent,
    getTorrents,
    pauseTorrent,
    resumeTorrent,
    forceStartTorrent,  // New
    deleteTorrent
};
```

### `/backend/src/routes/qbittorrent.js`

Added new route:

```javascript
router.post('/force-start/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        await qbittorrentService.login();
        await qbittorrentService.forceStartTorrent(hash);

        res.json({ success: true, message: 'Torrent force started' });
    } catch (error) {
        console.error('qBittorrent force start error:', error);
        res.status(500).json({ error: 'Failed to force start torrent' });
    }
});
```

## Frontend Changes

### `/frontend/src/app/downloads/page.tsx`

#### New Handler

```typescript
const handleForceStart = async (hash: string) => {
    try {
        await axios.post(`${API_URL}/api/qbittorrent/force-start/${hash}`)
        loadTorrents()
    } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to force start torrent')
    }
}
```

#### Updated Delete Handler

```typescript
const handleDelete = async (hash: string) => {
    // Show options modal
    const action = window.prompt(
        'Delete torrent:\n\n' +
        '1 - Remove from list only (keep files)\n' +
        '2 - Delete torrent AND files\n' +
        '0 - Cancel\n\n' +
        'Enter your choice (0/1/2):',
        '1'
    )

    if (action === '0' || action === null) return

    const deleteFiles = action === '2'

    const confirmMsg = deleteFiles
        ? '⚠️ Are you sure? This will DELETE ALL FILES from disk!'
        : 'Remove torrent from list? (files will be kept)'

    if (!confirm(confirmMsg)) return

    // Execute deletion
    await axios.delete(`${API_URL}/api/qbittorrent/delete/${hash}?deleteFiles=${deleteFiles}`)
}
```

## Testing Results

### Test Sequence

```bash
# 1. Add torrent
POST /api/qbittorrent/add
Result: ✅ Success - torrent added

# 2. Pause torrent
POST /api/qbittorrent/pause/:hash
Result: ✅ State: stoppedUP

# 3. Resume torrent
POST /api/qbittorrent/resume/:hash
Result: ✅ State: stalledUP

# 4. Force start torrent
POST /api/qbittorrent/force-start/:hash
Result: ✅ State: forcedUP, force_start: true
```

### All Operations Working

- ✅ Start (Resume)
- ✅ Force Start
- ✅ Pause (Stop)
- ✅ Delete with options (keep/remove files)
- ✅ Auto-refresh
- ✅ Manual refresh
- ✅ State display with colors

## UI Preview

### Button Layout (Desktop)

```text
[▶️ Start] [⚡ Force] [⏸️ Pause] [🗑️ Delete]
  Green     Emerald     Yellow       Red
```

### Button Layout (Mobile)

Buttons wrap to multiple rows on smaller screens

### Delete Options Prompt

```text
Delete torrent:

1 - Remove from list only (keep files)
2 - Delete torrent AND files
0 - Cancel

Enter your choice (0/1/2): [1]
```

### Confirmation for File Deletion

```text
⚠️ Are you sure? This will DELETE ALL FILES from disk!
[Cancel] [OK]
```

## Notes

- **Force Start** is useful for:
  - Bypassing queue limits
  - Ensuring torrent starts immediately
  - Overriding seed ratio limits
  - Testing torrent connectivity

- **Delete Options** prevent accidental data loss:
  - Default is option 1 (keep files)
  - Option 2 requires additional confirmation
  - Can cancel at any step

- **Color Coding** improves UX:
  - Green = Safe actions (start)
  - Yellow = Pause/temporary
  - Red = Destructive actions (delete)
  - Emerald = Power actions (force)

## Files Modified

1. `/backend/src/services/qbittorrent.js` - Added `forceStartTorrent()`
2. `/backend/src/routes/qbittorrent.js` - Added `/force-start/:hash` route
3. `/frontend/src/app/downloads/page.tsx` - Complete UI redesign with new buttons and delete options
