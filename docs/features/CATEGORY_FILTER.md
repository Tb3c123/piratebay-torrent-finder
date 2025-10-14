# Category Filter for Pirate Bay Search

## Overview

Added comprehensive category filtering to the Direct Pirate Bay search page, allowing users to filter torrent results by specific content types (Movies, TV Shows, Games, Software, etc.).

## Features

### 1. **50+ Categories Available**

Full list of Pirate Bay categories organized by main types:

- **Audio** (Music, Audio Books, Sound Clips)
- **Video** (Movies, TV Shows, HD content, 3D)
- **Applications** (Windows, Mac, UNIX, Mobile)
- **Games** (PC, Console, Mobile)
- **Porn** (Adult content categories)
- **Other** (E-books, Comics, Pictures, etc.)

### 2. **Popular Categories Quick Access**

Top 10 most commonly used categories for quick filtering:

- 🌐 All
- 🎬 Video
- 🎥 Movies
- 📺 TV Shows
- 🎬 HD Movies
- 📺 HD TV Shows
- 🎵 Audio
- 💻 Applications
- 🎮 Games
- 📚 E-books

### 3. **Toggle Between Views**

- **Popular View**: Shows 10 most common categories
- **All Categories View**: Shows all 50+ categories
- One-click toggle between views

## Component Structure

### CategoryFilter Component (`/components/CategoryFilter.tsx`)

**Key Features:**

```typescript
export const PIRATEBAY_CATEGORIES: CategoryFilter[] = [
    { id: '0', name: 'All', icon: '🌐' },
    { id: '200', name: 'Video', icon: '🎬' },
    { id: '201', name: 'Movies', icon: '🎥' },
    // ... 50+ categories
]

export const POPULAR_CATEGORIES: CategoryFilter[] = [
    // 10 most used categories
]
```

**Props:**

```typescript
interface CategoryFilterProps {
    selectedCategory: string        // Currently selected category ID
    onCategoryChange: (category: string) => void  // Callback when category changes
}
```

## Integration

### Search Page Updates (`/app/torrent/search/page.tsx`)

**State Management:**

```typescript
const [selectedCategory, setSelectedCategory] = useState('0') // 0 = All

// Auto-search when category changes
useEffect(() => {
    if (query) {
        searchPirateBay(query, selectedCategory)
    }
}, [query, selectedCategory])
```

**API Integration:**

```typescript
const searchPirateBay = async (searchQuery: string, category: string = '0') => {
    const response = await axios.get(`${API_URL}/api/search`, {
        params: {
            query: searchQuery,
            category: category  // Pass category to backend
        }
    })
}
```

**Backend Support:**
The backend already supports category filtering via the `category` parameter in `/api/search`.

## Category IDs Reference

### Main Categories

| ID  | Name | Description |
|-----|------|-------------|
| 0   | All  | No filter (search all) |
| 100 | Audio | All audio content |
| 200 | Video | All video content |
| 300 | Applications | Software and apps |
| 400 | Games | All game types |
| 500 | Porn | Adult content |
| 600 | Other | E-books, comics, etc. |

### Video Sub-Categories

| ID  | Name | Icon |
|-----|------|------|
| 201 | Movies | 🎥 |
| 202 | Movies DVDR | 💿 |
| 203 | Music Videos | 🎤 |
| 204 | Movie Clips | 🎞️ |
| 205 | TV Shows | 📺 |
| 206 | Handheld | 📱 |
| 207 | HD - Movies | 🎬 |
| 208 | HD - TV Shows | 📺 |
| 209 | 3D | 🕶️ |
| 299 | Other Video | 📹 |

### Games Sub-Categories

| ID  | Name | Icon |
|-----|------|------|
| 401 | PC | 🖥️ |
| 402 | Mac | 🍎 |
| 403 | PSx | 🎮 |
| 404 | XBOX360 | 🎮 |
| 405 | Wii | 🎮 |
| 406 | Handheld | 🕹️ |
| 407 | IOS | 📱 |
| 408 | Android | 🤖 |
| 499 | Other Games | 🎯 |

### Applications Sub-Categories

| ID  | Name | Icon |
|-----|------|------|
| 301 | Windows | 🪟 |
| 302 | Mac | 🍎 |
| 303 | UNIX | 🐧 |
| 304 | Handheld | 📱 |
| 305 | IOS | 📱 |
| 306 | Android | 🤖 |
| 399 | Other OS | 💾 |

## UI Design

### Filter Section Layout

```
┌─────────────────────────────────────────────────┐
│ 🔍 Filter by Category    [Show All → / ← Popular] │
├─────────────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  🌐  │  │  🎬  │  │  🎥  │  │  📺  │  ...    │
│  │ All  │  │Video │  │Movies│  │ TV   │         │
│  └──────┘  └──────┘  └──────┘  └──────┘         │
│  (Active category highlighted in blue)          │
├─────────────────────────────────────────────────┤
│ Active filter: [🎥 Movies ×]                    │
├─────────────────────────────────────────────────┤
│ Showing 10 categories (popular)                 │
└─────────────────────────────────────────────────┘
```

### Visual States

**Default (Not Selected):**

```css
bg-gray-700 text-gray-300
hover:bg-gray-600 hover:text-white
```

**Selected:**

```css
bg-blue-600 text-white shadow-lg scale-105
```

### Active Filter Badge

When a category is selected (not "All"), shows a removable badge:

```
Active filter: [🎥 Movies ×]
         ↑            ↑
      Icon        Remove button
```

## User Experience

### Search Flow with Filter

```
1. Homepage → Direct Pirate Bay mode
2. Search "ubuntu" → See all results
3. Click "💻 Applications" filter
4. Results update to show only applications
5. Click "🐧 UNIX" for more specific results
6. Download desired torrent
```

### Category Change Behavior

- **Instant Re-search**: When category changes, automatically re-runs search with new filter
- **No Page Reload**: Results update dynamically
- **State Persistence**: Selected category maintained during session
- **Clear Filter**: Click "×" on active badge or select "All" to remove filter

### Toggle Between Views

```
Popular View (10 categories)
    ↕ [Show All →]
All Categories View (50+ categories)
    ↕ [← Show Popular]
```

## Code Examples

### Using the Filter

```typescript
// Component usage
<CategoryFilterComponent
    selectedCategory={selectedCategory}
    onCategoryChange={handleCategoryChange}
/>

// Handler
const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // useEffect will auto-trigger search
}
```

### Search with Category

```typescript
// Search function
const searchPirateBay = async (query: string, category: string) => {
    const response = await axios.get(`${API_URL}/api/search`, {
        params: {
            query: query,
            category: category  // '0' for all, '201' for movies, etc.
        }
    })
}
```

## Testing

### Test Popular Categories

1. Go to Direct Pirate Bay search
2. Search for "ubuntu"
3. See popular categories (10 items)
4. Click "💻 Applications"
5. Results should filter to applications only

### Test All Categories

1. Click "Show All →"
2. See 50+ categories in grid
3. Scroll through all options
4. Click "🐧 UNIX"
5. Results should filter to UNIX applications

### Test Category Clear

1. Select any category (e.g., "Movies")
2. See active filter badge: "🎥 Movies ×"
3. Click the "×" button
4. Filter should clear, show all results again

### Test Auto Re-search

1. Search for "game"
2. Select "🎮 Games" category
3. Notice instant results update
4. Switch to "🖥️ PC" sub-category
5. Results update again automatically

## Benefits

✅ **Precise Filtering**: Find exactly what you're looking for
✅ **Large Collection**: 50+ categories covering all content types
✅ **Quick Access**: Popular categories for common searches
✅ **Visual Icons**: Easy-to-identify category icons
✅ **Active Indicator**: Clear visual feedback for selected filter
✅ **Easy Clear**: One-click to remove filter
✅ **Auto Re-search**: No manual refresh needed
✅ **Responsive Grid**: Works on mobile and desktop

## Future Enhancements

- **Multi-select Categories**: Select multiple categories at once
- **Category Search**: Search within category list
- **Favorite Categories**: Pin frequently used categories
- **Category Stats**: Show torrent count per category
- **Smart Suggestions**: Suggest relevant categories based on query
- **Category History**: Remember recently used categories
- **Keyboard Shortcuts**: Quick category switching with keys

## Performance

- **Lazy Loading**: Categories loaded on demand
- **Optimized Re-render**: Only updates when category changes
- **Fast API**: Backend category filtering is efficient
- **Instant Feedback**: Visual state changes immediately
- **No Lag**: Category changes trigger search smoothly

## Accessibility

- **Keyboard Navigation**: Tab through categories
- **Screen Reader Support**: Proper ARIA labels
- **High Contrast**: Clear visual distinction
- **Large Touch Targets**: Easy to tap on mobile
- **Focus Indicators**: Clear focus state for keyboard users

This makes the Pirate Bay search much more powerful and user-friendly! 🎯🔍
