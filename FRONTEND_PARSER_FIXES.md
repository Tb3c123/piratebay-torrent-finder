# Frontend Parser Fixes - Systematic Review

## Issue

Backend always returns: `{ success: true, data: {...} }`
Frontend must parse: `response.data.data.*`

---

## Files to Fix

### ✅ ALREADY FIXED

1. **frontend/src/app/page.tsx**
   - ✅ Movie sections: `trending.data.data.movies`
   - ✅ Search: `response.data.data?.movies || response.data.movies` (with fallback)

2. **frontend/src/features/auth/services/authService.ts**
   - ✅ Login: `data.data.token` and `data.data.user`
   - ✅ FetchUserInfo: `data.data`
   - ✅ Register: Returns `data.data`

---

### ❌ NEEDS FIXING

#### 1. Movie Detail Page

**File:** `frontend/src/app/movie/[imdbId]/page.tsx`

**Current (WRONG):**

```typescript
const movieData = response.data.movie  // ❌
const torrents = torrentResponse.data.torrents  // ❌
```

**Should be:**

```typescript
const movieData = response.data.data.movie  // ✅
const torrents = torrentResponse.data.data.torrents  // ✅
```

**Lines to fix:** ~35, ~55

---

#### 2. Torrent Detail Page

**File:** `frontend/src/app/torrent/[id]/page.tsx`

**Current (WRONG):**

```typescript
const torrent = response.data  // ❌ (but might be correct if backend returns data directly)
```

**Need to check:** Backend response format for `/api/v1/torrent/:id`

- If backend returns `{ success, data: { torrent details } }` → use `response.data.data`
- If backend returns `{ success, data: [array] }` → use `response.data.data`

---

#### 3. Settings Service

**File:** `frontend/src/features/settings/services/settingsService.ts`

**Current (WRONG):**

```typescript
return response.data.settings  // ❌
```

**Should be:**

```typescript
return response.data.data.settings  // ✅
```

---

#### 4. Downloads Service

**File:** `frontend/src/features/downloads/services/downloadsService.ts`

**Check:**

- `getDownloads()` → Should use `response.data.data.torrents`
- `addDownload()` → Should use `response.data.data`
- `deleteDownload()` → Should use `response.data.data`

---

#### 5. History Service

**File:** `frontend/src/features/history/services/historyService.ts`

**Check:**

- `getHistory()` → Should use `response.data.data` (array)
- `deleteHistory()` → Should use `response.data.data`
- `clearHistory()` → Should use `response.data.data`

---

#### 6. Movies Service

**File:** `frontend/src/features/movies/services/moviesService.ts`

**Check all functions:**

- `searchMovies()` → `response.data.data.movies`
- `getMovieDetails()` → `response.data.data.movie`
- `getTorrents()` → `response.data.data.torrents`
- `getTrending()` → `response.data.data.movies`
- etc.

---

#### 7. Torrents Service

**File:** `frontend/src/features/torrents/services/torrentsService.ts`

**Check:**

- `searchTorrents()` → `response.data.data` (array)
- `getTorrentDetails()` → `response.data.data`

---

#### 8. Admin Pages

**File:** `frontend/src/app/admin/page.tsx`

**Check:**

- Users list → `response.data.data.users`
- Logs → `response.data.data` (array)

---

## Systematic Fix Pattern

For all API calls, use this pattern:

```typescript
try {
  const response = await axios.get(`${API_URL}/api/v1/endpoint`)

  // Always check success first
  if (response.data.success) {
    // ALWAYS use response.data.data
    const actualData = response.data.data

    // Then access specific properties
    const items = actualData.movies || actualData.torrents || actualData

    return items
  } else {
    throw new Error(response.data.error || 'Request failed')
  }
} catch (error) {
  console.error('Error:', error)
  throw error
}
```

---

## Testing Checklist

After fixes, test:

- [ ] Homepage - Trending/Popular/Latest sections load
- [ ] Search - Movie search returns results
- [ ] Movie Detail - Clicking movie shows details
- [ ] Torrents - Movie detail shows torrent list
- [ ] Login - Auth works and saves token
- [ ] Settings - Can view/update qBittorrent settings
- [ ] History - Search history displays
- [ ] Downloads - Active downloads list shows
- [ ] Admin - User list and logs display (if admin)

---

## Priority Order

1. **HIGH** - Movie detail page (most used)
2. **HIGH** - Settings service (breaks qBittorrent integration)
3. **MEDIUM** - Downloads service
4. **MEDIUM** - History service
5. **LOW** - Torrent detail (less used)
6. **LOW** - Admin pages (admin only)
