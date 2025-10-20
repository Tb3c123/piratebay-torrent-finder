# Load More Search Results Feature

## Overview

Added pagination support to torrent search page, allowing users to load more results beyond the initial 10-30 torrents.

## Features

### 1. Automatic Pagination Detection

- Backend already supported `page` parameter in search API
- Frontend now tracks current page number
- Detects if more results are available (based on result count)

### 2. Load More Button

- Appears at bottom of search results
- Shows current page number
- Displays total results count
- Loading state during fetch

### 3. Smart Result Management

- **Initial Search**: Clears previous results, resets to page 0
- **Category Change**: Resets pagination and loads fresh results
- **Load More**: Appends new results to existing list
- **Alternative Search**: Resets pagination for new query

### 4. User Feedback

- Loading indicator during initial search
- "Loading more results..." during pagination
- "End of results" message when no more pages available
- Result count display

## Implementation

### Frontend Changes

#### State Management

```typescript
const [torrents, setTorrents] = useState<Torrent[]>([])
const [loading, setLoading] = useState(false)
const [loadingMore, setLoadingMore] = useState(false)
const [currentPage, setCurrentPage] = useState(0)
const [hasMore, setHasMore] = useState(true)
```

#### Search Function with Pagination

```typescript
const searchPirateBay = async (
    searchQuery: string,
    category: string = '0',
    page: number = 0,
    append: boolean = false
) => {
    if (append) {
        setLoadingMore(true)
    } else {
        setLoading(true)
    }

    const response = await axios.get(`${API_URL}/api/search`, {
        params: {
            query: searchQuery,
            category: category,
            page: page.toString()
        }
    })

    const results = Array.isArray(response.data) ? response.data : []

    if (append) {
        setTorrents(prev => [...prev, ...results])
    } else {
        setTorrents(results)
    }

    // Pirate Bay typically returns 30 results per page
    setHasMore(results.length >= 30)
}
```

#### Load More Handler

```typescript
const handleLoadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    searchPirateBay(query, selectedCategory, nextPage, true)
}
```

### UI Components

#### Load More Button

```tsx
{!loading && !error && torrents.length > 0 && hasMore && (
    <div className="mt-6 text-center">
        <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600
                       hover:from-blue-700 hover:to-purple-700 text-white rounded-lg
                       font-semibold text-lg transition-all shadow-lg
                       hover:shadow-xl transform hover:scale-105"
        >
            {loadingMore ? (
                <>⏳ Loading more results...</>
            ) : (
                <>📥 Load More Results (Page {currentPage + 2})</>
            )}
        </button>
        <p className="text-gray-500 text-sm mt-3">
            Currently showing {torrents.length} results
        </p>
    </div>
)}
```

#### End of Results Message

```tsx
{!loading && !error && torrents.length > 0 && !hasMore && (
    <div className="mt-6 text-center py-6 bg-gray-800/50 rounded-lg
                    border border-gray-700">
        <p className="text-gray-400 text-lg">
            ✅ End of results - Showing all {torrents.length} torrents
        </p>
    </div>
)}
```

## Backend API

### Endpoint

```text
GET /api/search
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `query` | string | required | Search query |
| `category` | string | '200' | Category code (0=All, 200=Video, etc.) |
| `page` | string | '0' | Page number (0-indexed) |

### Example Request

```bash
curl "http://localhost:3001/api/search?query=big+buck+bunny&category=0&page=1"
```

### Response

```json
[
    {
        "name": "Big Buck Bunny",
        "size": "276.45 MB",
        "seeders": 50,
        "leechers": 10,
        "magnet": "magnet:?xt=urn:btih:...",
        "uploadDate": "2 days ago"
    }
]
```

## User Flow

### Initial Search

1. User enters search query
2. Page loads with first 30 results
3. "Load More" button appears if 30+ results returned

### Loading More Results

1. User clicks "Load More Results (Page 2)"
2. Button shows loading state with spinner
3. New results appended to existing list
4. Page counter increments
5. Button updates to "Page 3" or disappears if no more results

### Category Change

1. User selects different category filter
2. Results clear and reset to page 0
3. New search performed with selected category
4. Pagination state resets

### Alternative Search

1. User clicks alternative search suggestion
2. Results clear and pagination resets
3. New search performed with alternative query

## Visual Design

### Button States

- **Normal**: Blue-to-purple gradient with hover animation
- **Loading**: Gray with spinner icon
- **Disabled**: Gray with reduced opacity

### Feedback Messages

- **Loading More**: "⏳ Loading more results..."
- **Result Count**: "Currently showing X results"
- **End of Results**: "✅ End of results - Showing all X torrents"

## Notes

### Pirate Bay Pagination

- Typically returns 30 results per page
- Page parameter is 0-indexed (0, 1, 2, ...)
- Empty array returned when no more results

### Performance Considerations

- Results are appended, not replaced (keeps scroll position)
- Search history only saved on initial search, not pagination
- Separate loading states for initial vs. pagination

### Edge Cases Handled

- No results on initial search: Shows error message
- No more results: Shows "End of results" message
- Category change during pagination: Resets state
- Alternative search: Resets pagination

## Files Modified

### Frontend

- `/frontend/src/app/torrent/search/page.tsx`
  - Added `loadingMore`, `currentPage`, `hasMore` state
  - Updated `searchPirateBay()` with pagination parameters
  - Added `handleLoadMore()` function
  - Added Load More button UI
  - Added end of results message
  - Reset pagination on category/query changes

### Backend (No Changes Required)

- `/backend/src/routes/search.js` - Already supports `page` parameter
- `/backend/src/services/piratebay.js` - Already implements pagination

## Testing

### Test Scenarios

1. **Initial Search**

   ```text
   Search: "big buck bunny"
   Expected: 30 results, Load More button visible
   ```

2. **Load More**

   ```text
   Click: Load More
   Expected: 60 total results, button updates to "Page 3"
   ```

3. **End of Results**

   ```text
   Click: Load More multiple times
   Expected: "End of results" message when exhausted
   ```

4. **Category Change**

   ```text
   Select: Movies category
   Expected: Results reset, back to page 1
   ```

5. **Alternative Search**

   ```text
   Click: Alternative search suggestion
   Expected: New results, pagination reset
   ```

## Future Enhancements

Potential improvements:

- Infinite scroll instead of button
- Keyboard shortcut for load more
- Pre-load next page in background
- Jump to specific page number
- Result count from backend (if API supports)
- "Load All" button option
