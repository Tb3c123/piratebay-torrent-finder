# Session Cache System

## Overview

The application uses a custom **sessionStorage caching system** to persist page data across F5 refreshes. This prevents users from being redirected to the homepage when they refresh detail pages.

## Custom Hooks

### 1. `useSessionCache<T>`

Automatic caching hook with built-in data fetching logic.

**Use case:** Simple pages where you just need to fetch and cache data automatically.

**Example:**

```typescript
import { useSessionCache } from '@/hooks/useSessionCache'

const { data: movie, loading, error, refetch } = useSessionCache<MovieDetails>(
    `movie_${imdbId}`,
    async () => {
        const response = await axios.get(`/api/movies/${imdbId}`)
        return response.data.movie
    },
    (cachedMovie) => {
        // Optional callback when data is restored from cache
        console.log('Loaded from cache!', cachedMovie)
        // Can trigger background tasks like fetching torrents
        fetchTorrents(cachedMovie)
    }
)
```

**Features:**

- ✅ Automatic fetch on mount
- ✅ Automatic cache save after successful fetch
- ✅ Automatic cache restore on F5 refresh
- ✅ Optional callback for cache restoration
- ✅ Built-in loading/error states
- ✅ `refetch()` function for manual refresh

### 2. `useManualCache`

Manual caching hook for fine-grained control.

**Use case:** Complex pages where you need manual control over when to save/load cache.

**Example:**

```typescript
import { useManualCache } from '@/hooks/useSessionCache'

const { getCached, saveToCache, clearCache } = useManualCache(`torrent_${id}`)

// Get cached data
const cached = getCached<TorrentData>()
if (cached) {
    setData(cached)
}

// Save to cache
saveToCache(newData)

// Clear cache
clearCache()
```

**Features:**

- ✅ Full manual control
- ✅ Get, save, and clear operations
- ✅ Type-safe with TypeScript generics
- ✅ Console logging for debugging

## Implementation Examples

### Movie/Anime Detail Pages

Uses `useSessionCache` for automatic caching:

```typescript
// frontend/src/app/movie/[imdbId]/page.tsx
const { data: movie, loading, error } = useSessionCache<MovieDetails>(
    `movie_${params.imdbId}`,
    async () => {
        const response = await axios.get(`${API_URL}/api/movies/${params.imdbId}`)
        if (response.data.success) {
            return response.data.movie
        } else {
            throw new Error(response.data.error || 'Movie not found')
        }
    },
    (movieData) => {
        // On cache restore, fetch torrents in background
        handleAutoSearch(movieData)
    }
)
```

### Torrent Detail Page

Uses `useManualCache` for complex query param handling:

```typescript
// frontend/src/app/torrent/[id]/page.tsx
const { getCached, saveToCache } = useManualCache(`torrent_${params.id}`)

// Try query params first
if (title && magnet) {
    const torrentData = { id, title, magnet, ... }
    saveToCache(torrentData)
    setTorrent(torrentData)
} else {
    // Fall back to cache
    const cached = getCached<TorrentBasic>()
    if (cached) {
        setTorrent(cached)
    }
}
```

## Cache Keys Pattern

Cache keys follow a consistent pattern:

- `movie_${imdbId}` - Movie details
- `anime_${malId}` - Anime details
- `torrent_${id}` - Torrent details

This ensures no key collisions between different content types.

## Cache Behavior

### Storage Scope

- **Storage Type:** `sessionStorage` (not `localStorage`)
- **Lifetime:** Exists only while browser tab is open
- **Cleared When:** Tab is closed or browser is quit
- **Survives:** F5 refresh, back/forward navigation

### Data Flow

**First Visit:**

1. Check cache → Empty
2. Fetch from API
3. Save to cache
4. Display data

**F5 Refresh:**

1. Check cache → Found!
2. Display cached data immediately
3. Optional: Fetch fresh data in background

**Tab Close:**

1. sessionStorage cleared automatically
2. Next visit starts fresh

## Console Logging

The hooks log cache operations to console:

```
📦 Restored data from cache: movie_tt1234567
💾 Saved data to cache: anime_52991
🗑️ Cleared cache: torrent_12345
```

These logs help with debugging cache behavior.

## Benefits

✅ **Fast Page Loads:** Instant display from cache, no API delay
✅ **F5 Resilience:** Refresh doesn't lose page state
✅ **No Redirect:** Stay on current page after refresh
✅ **Type Safe:** Full TypeScript support with generics
✅ **Reusable:** Same hooks work across all pages
✅ **Automatic Cleanup:** Cache clears when tab closes
✅ **Debugging:** Console logs show cache operations

## Migration from Old Code

**Before (manual sessionStorage):**

```typescript
const cacheKey = `movie_${id}`
const cached = sessionStorage.getItem(cacheKey)
if (cached) {
    const data = JSON.parse(cached)
    setMovie(data)
    return
}
// fetch logic...
sessionStorage.setItem(cacheKey, JSON.stringify(data))
```

**After (with hook):**

```typescript
const { data: movie, loading, error } = useSessionCache(
    `movie_${id}`,
    async () => {
        // fetch logic
        return data
    }
)
```

Much cleaner and less code! 🎉

## Testing

To verify the cache is working:

1. Visit a movie/anime/torrent detail page
2. Open DevTools Console
3. Look for: `💾 Saved data to cache: ...`
4. Press F5 to refresh
5. Look for: `📦 Restored data from cache: ...`
6. Page should load instantly without API call

## Future Enhancements

Possible improvements:

- Cache expiration (TTL)
- Cache versioning (invalidate on schema changes)
- LRU cache with size limits
- Cross-tab synchronization with BroadcastChannel
- Fallback to IndexedDB for larger data
