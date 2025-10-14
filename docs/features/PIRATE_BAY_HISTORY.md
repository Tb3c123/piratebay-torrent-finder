# Search History - Pirate Bay Integration

## Overview

The search history feature now tracks **both** types of searches:

1. **Movie Search** - OMDB-based movie/TV show searches
2. **Direct Pirate Bay Search** - Direct torrent searches

## Changes Made

### 1. Backend (Already Supported)

The backend history API already supported `category` field:

```javascript
// POST /api/history
{
    query: "search term",
    category: "piratebay" // or "0" for movie search
}
```

### 2. Frontend Updates

#### A. Torrent Search Page (`/frontend/src/app/torrent/search/page.tsx`)

Added history saving after successful search:

```typescript
// Save to search history
try {
    await axios.post(`${API_URL}/api/history`, {
        query: searchQuery,
        category: 'piratebay' // Mark as direct Pirate Bay search
    })
} catch (historyErr) {
    console.error('Failed to save search history:', historyErr)
}
```

#### B. Burger Menu (`/frontend/src/components/BurgerMenu.tsx`)

**Updated History Item Handler:**

```typescript
const handleSearchFromHistory = (item: SearchHistoryItem) => {
    setIsOpen(false)

    // If it's a direct Pirate Bay search, go to torrent search page
    if (item.category === 'piratebay') {
        router.push(`/torrent/search?q=${encodeURIComponent(item.query)}`)
    } else {
        // Otherwise, go to homepage for movie search
        router.push(`/?search=${encodeURIComponent(item.query)}`)
    }
}
```

**Visual Badge Differentiation:**

```typescript
{item.category === 'piratebay' ? (
    <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded flex items-center gap-1">
        🏴‍☠️ Pirate
    </span>
) : item.type && (
    <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">
        {item.type}
    </span>
)}
```

## User Experience

### Search History Display

**Movie Search** (Blue Badge):

```
Avatar: The Way of Water
3:45 PM • 8 results
                    [movie]
```

**Pirate Bay Search** (Purple Badge):

```
ubuntu iso
3:42 PM
                    [🏴‍☠️ Pirate]
```

### Click Behavior

1. **Click on Movie Search History Item:**
   - Redirects to homepage: `/?search=Avatar`
   - Sets search query in search bar
   - User can click "Search" button to re-run movie search

2. **Click on Pirate Bay Search History Item:**
   - Redirects to torrent search page: `/torrent/search?q=ubuntu+iso`
   - Automatically re-runs the Pirate Bay search
   - Shows torrent results immediately

## Data Structure

### SearchHistoryItem Interface

```typescript
interface SearchHistoryItem {
    id?: number
    query: string
    timestamp: number | string
    type?: 'movie' | 'anime'        // For movie/anime searches
    category?: string                 // 'piratebay' for direct searches
    resultCount?: number
}
```

### Storage Format (Backend)

```json
[
    {
        "id": 1728934567890,
        "query": "ubuntu iso",
        "category": "piratebay",
        "timestamp": 1728934567890
    },
    {
        "id": 1728934512345,
        "query": "Avatar",
        "category": "0",
        "timestamp": 1728934512345
    }
]
```

## Search Flow Comparison

### Movie Search Flow

```
Homepage → Search Bar (Movie mode) →
Enter query → Click Search →
Movie results displayed →
Save to history (category: "0")
```

### Pirate Bay Search Flow

```
Homepage → Search Bar (Direct mode) →
Enter query → Click Search →
Redirect to /torrent/search?q=... →
Torrent results displayed →
Save to history (category: "piratebay")
```

## Testing

### Test Direct Pirate Bay Search

1. Go to homepage
2. Click "Direct Pirate Bay" button
3. Search for "ubuntu iso"
4. Wait for results
5. Open burger menu → Check history
6. Should see "ubuntu iso" with 🏴‍☠️ Pirate badge

### Test History Click

1. Click on Pirate Bay history item
2. Should redirect to `/torrent/search?q=ubuntu+iso`
3. Should show torrent results
4. Click on Movie history item
5. Should redirect to `/?search=Avatar`
6. Search bar should be filled with "Avatar"

### Test Mixed History

1. Do 2 movie searches: "Avatar", "Inception"
2. Do 2 Pirate Bay searches: "ubuntu", "linux mint"
3. Open burger menu
4. Should see all 4 items with correct badges:
   - Avatar (blue "movie")
   - Inception (blue "movie")
   - ubuntu (purple "🏴‍☠️ Pirate")
   - linux mint (purple "🏴‍☠️ Pirate")

## Features

✅ **Dual Search Tracking:** Movie and Pirate Bay searches both saved
✅ **Visual Distinction:** Purple 🏴‍☠️ badge for Pirate searches, blue for movie
✅ **Smart Navigation:** Click history item goes to correct page type
✅ **Grouped by Date:** Today, Yesterday, Earlier (Last 30 days)
✅ **Automatic Cleanup:** Old entries deleted after 30 days
✅ **Clear All:** One button to clear entire history

## Future Enhancements

- **Filter by Type:** Toggle to show only Movie or only Pirate Bay searches
- **Separate Tabs:** "Movies" tab and "Torrents" tab in history
- **Result Count for Pirate Bay:** Show torrent count in history
- **Quick Actions:** Add "Search Again" or "Delete" buttons per item
- **Pinned Searches:** Pin frequently used searches to top
- **Search within History:** Filter history by keyword

## Color Scheme

- **Movie Search Badge:** `bg-blue-900 text-blue-200`
- **Pirate Bay Badge:** `bg-purple-900 text-purple-200` + 🏴‍☠️ emoji
- **Anime Search Badge:** `bg-blue-900 text-blue-200` (same as movie)

This visual distinction makes it easy to identify search types at a glance! 🎨
