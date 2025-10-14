# Burger Menu with Search History & System Logs

## Overview

Added a burger menu in the top-left corner containing:

1. **Search History** - Quick access to recent searches
2. **Settings & Account** - Placeholder for future features
3. **System Logs** - System operations monitoring

## Features

### 🍔 Burger Menu

- **Location:** Top-left corner (fixed position)
- **Animation:** Smooth slide-in from left
- **Overlay:** Dark backdrop when open
- **Responsive:** Works on mobile and desktop

### 🔍 Search History Section

**Features:**

- Shows last 20 searches
- Click any search to re-run it
- Displays:
  - Query text
  - Result count
  - Timestamp
  - Type badge (movie/anime)
- **Clear button** to delete all history
- Auto-refresh when menu opens

**Interaction:**

- Click search item → Redirects to homepage with search
- Uses URL params: `/?search=query`
- Homepage automatically performs search from URL

### ⚙️ Settings & Account (Placeholder)

- Grayed out buttons
- "Coming Soon" labels
- Reserved space for future features:
  - User settings
  - qBittorrent configuration
  - Theme preferences
  - User account management

### 📋 System Logs Section

**Features:**

- Real-time system logs display
- **Filter by level:**
  - All
  - INFO (blue)
  - SUCCESS (green)
  - WARNING (yellow)
  - ERROR (red)
  - DEBUG (gray)
- Color-coded badges for quick identification
- Detailed view with timestamps
- JSON details expansion for complex logs
- **Clear button** to delete all logs
- Scrollable with max height
- Auto-refresh when menu opens

**Log Entry Display:**

- Level badge with color
- Timestamp (HH:MM:SS)
- Message text
- Optional JSON details (formatted)

## Implementation

### Components Created

#### 1. BurgerMenu.tsx

New component with three main sections:

```typescript
<BurgerMenu>
  <SearchHistory />
  <PlaceholderSection />
  <SystemLogs />
</BurgerMenu>
```

**State Management:**

- `isOpen` - Menu visibility
- `searchHistory` - Recent searches
- `logs` - System log entries
- `logLevel` - Current filter level

**API Calls:**

- `GET /api/history` - Load search history
- `DELETE /api/history` - Clear history
- `GET /api/logs?level=X` - Load logs with filter
- `DELETE /api/logs` - Clear logs

#### 2. Layout Integration

Added to `app/layout.tsx`:

```typescript
<body>
  <BurgerMenu />
  {children}
</body>
```

Menu available on all pages globally.

#### 3. Homepage Integration

Updated `app/page.tsx`:

- Added `useSearchParams()` to read URL params
- Wrapped in `<Suspense>` boundary (Next.js requirement)
- Created `performSearch(query)` function for reusability
- Auto-executes search when `?search=query` in URL

## User Flow

### Search from History

1. User opens burger menu (top-left button)
2. Sees recent searches in "Search History" section
3. Clicks a search item
4. Menu closes
5. Homepage loads with `?search=query` param
6. Search executes automatically
7. Results displayed

### View System Logs

1. User opens burger menu
2. Scrolls to "System Logs" section (bottom)
3. Selects log level filter (optional)
4. Views color-coded log entries
5. Expands JSON details if needed
6. Can clear logs if desired

## UI/UX Improvements

### Visual Design

- **Burger Icon:** Animated 3-line hamburger
  - Transforms to X when open
  - Smooth rotation animation
- **Sidebar:** 320px width (w-80)
- **Dark Theme:** Matches app aesthetic
  - bg-gray-900 main
  - bg-gray-800 cards
  - bg-gray-700 hover states
- **Overlay:** Semi-transparent backdrop
- **Scrolling:** Smooth, natural feel

### Accessibility

- Proper `aria-label` on burger button
- Keyboard accessible (Tab navigation)
- Click outside to close
- Escape key support (can be added)

### Performance

- Lazy loading: Only fetches data when menu opens
- Auto-refresh: Data reloads on each open
- Efficient rendering: Virtualized list possible for large histories

## Code Structure

```
frontend/src/
├── components/
│   └── BurgerMenu.tsx          ✅ NEW - Complete burger menu
├── app/
│   ├── layout.tsx              🔄 MODIFIED - Added <BurgerMenu />
│   └── page.tsx                🔄 MODIFIED - Added URL param support
```

## Technical Details

### Suspense Boundary

Next.js requires `useSearchParams()` to be wrapped in `<Suspense>`:

```typescript
export default function Home() {
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <HomeContent />
        </Suspense>
    )
}
```

This prevents SSR errors and improves hydration.

### URL Parameters

Search from history uses URL params:

```typescript
router.push(`/?search=${encodeURIComponent(query)}`)
```

Homepage reads and executes:

```typescript
const searchParams = useSearchParams()
const searchFromUrl = searchParams.get('search')
if (searchFromUrl) performSearch(searchFromUrl)
```

### API Integration

All existing APIs work without changes:

- `GET /api/history` - Already exists
- `DELETE /api/history` - Already exists
- `GET /api/logs` - Already exists with filter support
- `DELETE /api/logs` - Already exists

## Testing Checklist

### ✅ Burger Menu

- [x] Opens on click
- [x] Closes on overlay click
- [x] Smooth animation
- [x] Icon transforms correctly

### ✅ Search History

- [x] Loads recent searches
- [x] Displays correct info
- [x] Click re-runs search
- [x] Clear button works
- [x] Empty state shows

### ✅ System Logs

- [x] Loads logs correctly
- [x] Filter dropdown works
- [x] Color coding correct
- [x] Timestamps display
- [x] Clear button works
- [x] Scrolling works

### ✅ Integration

- [x] Menu available on all pages
- [x] Search from history works
- [x] URL params handled correctly
- [x] No console errors
- [x] Mobile responsive

## Future Enhancements

### Short Term

- [ ] Add keyboard shortcuts (Ctrl+H for history, Ctrl+L for logs)
- [ ] Add search within history
- [ ] Export logs feature
- [ ] Persistent menu state (remember open/closed)

### Medium Term

- [ ] Implement Settings page
  - qBittorrent connection settings
  - Theme selection
  - Language preferences
- [ ] Implement Account system
  - User authentication
  - Personal preferences
  - Favorites/bookmarks

### Long Term

- [ ] Real-time log streaming (WebSocket)
- [ ] Log analytics dashboard
- [ ] Search history sync across devices
- [ ] Advanced log filtering (date range, keywords)

## Screenshots Description

### Burger Menu (Closed)

- Small hamburger icon in top-left
- Subtle hover effect

### Burger Menu (Open)

- Full sidebar visible
- Three sections clearly separated
- Search history at top
- Placeholder section in middle
- System logs at bottom
- Scrollable content area
- Footer with app version

### Search History Section

- List of recent searches
- Each item shows:
  - Query text (truncated if long)
  - Result count
  - Timestamp
  - Type badge
- Clear button in header

### System Logs Section

- Dropdown filter for log levels
- Color-coded log entries
- Each entry shows:
  - Level badge (colored)
  - Time
  - Message
  - Optional details (JSON)
- Clear button in header
- Scrollable list

## Commands Used

```bash
# Create BurgerMenu component
touch frontend/src/components/BurgerMenu.tsx

# Rebuild frontend
docker-compose up -d --build frontend
```

## Files Modified/Created

### Created

- `frontend/src/components/BurgerMenu.tsx` (320 lines)

### Modified

- `frontend/src/app/layout.tsx` - Added <BurgerMenu /> globally
- `frontend/src/app/page.tsx` - Added URL param support with Suspense

## Result

✅ **Success!**

- Burger menu fully functional
- Search history with click-to-search
- System logs with filtering
- Responsive and smooth animations
- Ready for Settings & Account features
