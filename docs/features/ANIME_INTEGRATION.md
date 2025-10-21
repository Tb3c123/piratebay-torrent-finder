# Anime Integration with Jikan API

## Overview

Integrated anime search and discovery using **Jikan API v4** - an unofficial MyAnimeList API that provides comprehensive anime data without requiring authentication.

## Features Added

### 🎌 Anime Search & Discovery

- **Search Anime**: Search MyAnimeList's anime database
- **Top Anime**: Get top-rated anime with filters (airing, upcoming, by popularity, favorites)
- **Seasonal Anime**: Browse current or specific season's anime
- **Anime Details**: Full anime information including synopsis, ratings, trailers, episodes, studios, etc.

### 📊 Cache Management

- **Anime Details Cache**: 60-minute TTL
- **Anime Search Cache**: 15-minute TTL
- Integrated into System Logs cache management

### ⚡ Rate Limiting

- Respects Jikan API limits: **3 requests/second**, **60 requests/minute**
- Automatic rate limiting with 350ms delay between requests

## API Endpoints

### 1. Search Anime

```bash
GET /api/anime/search?query={search_term}&page={page_number}
```

**Example**:

```bash
curl "http://localhost:3001/api/anime/search?query=naruto&page=1"
```

**Response**:

```json
{
  "success": true,
  "anime": [
    {
      "malId": 20,
      "title": "Naruto",
      "titleEnglish": "Naruto",
      "titleJapanese": "ナルト",
      "type": "TV",
      "episodes": 220,
      "status": "Finished Airing",
      "aired": "Oct 3, 2002 to Feb 8, 2007",
      "score": 8.01,
      "scoredBy": 2150000,
      "rank": 603,
      "popularity": 8,
      "synopsis": "...",
      "image": "https://cdn.myanimelist.net/images/anime/...",
      "trailer": "...",
      "genres": ["Action", "Adventure", "Fantasy"],
      "studios": ["Studio Pierrot"],
      "year": 2002,
      "rating": "PG-13 - Teens 13 or older"
    }
  ],
  "total": 150,
  "hasNextPage": true,
  "currentPage": 1
}
```

### 2. Top Anime

```bash
GET /api/anime/top?type={type}&filter={filter}&page={page}
```

**Parameters**:

- `type`: `tv`, `movie`, `ova`, `special`, `ona`, `music` (optional)
- `filter`: `airing`, `upcoming`, `bypopularity`, `favorite` (optional)
- `page`: Page number (default: 1)

**Example**:

```bash
# Get top airing TV anime
curl "http://localhost:3001/api/anime/top?type=tv&filter=airing"

# Get most popular anime
curl "http://localhost:3001/api/anime/top?filter=bypopularity"
```

### 3. Seasonal Anime

```bash
GET /api/anime/season?year={year}&season={season}
GET /api/anime/season  # Current season
```

**Seasons**: `winter`, `spring`, `summer`, `fall`

**Example**:

```bash
# Get current season anime
curl "http://localhost:3001/api/anime/season"

# Get specific season
curl "http://localhost:3001/api/anime/season?year=2025&season=winter"
```

**Response**:

```json
{
  "success": true,
  "anime": [...],
  "season": "fall",
  "year": 2025
}
```

### 4. Anime Details

```bash
GET /api/anime/:malId
```

**Example**:

```bash
curl "http://localhost:3001/api/anime/20"  # Naruto
```

**Response** includes:

- Basic info: title (multiple languages), type, episodes, status
- Ratings & popularity: score, rank, members, favorites
- Media: images (JPG/WebP)
- Production: studios, producers, licensors
- Classification: genres, themes, demographics
- Dates: aired, broadcast schedule, season/year
- Additional: synopsis, background, relations, streaming platforms, external links

## Cache Management

### Clear Anime Caches

```bash
# Clear anime details cache
POST http://localhost:3001/api/system/cache/clear/anime

# Clear anime search cache
POST http://localhost:3001/api/system/cache/clear/animesearch

# Clear all caches (including anime)
POST http://localhost:3001/api/system/cache/clear/all
```

### Get Cache Statistics

```bash
GET http://localhost:3001/api/system/cache/stats
```

Returns:

```json
{
  "success": true,
  "stats": {
    "anime": {
      "size": 15,
      "ttl": "60 minutes"
    },
    "animeSearch": {
      "size": 8,
      "ttl": "15 minutes"
    }
  }
}
```

## Technical Details

### File Structure

```text
backend/
├── src/
│   ├── services/
│   │   └── jikan.js          # Jikan API service with caching
│   └── routes/
│       ├── anime.js           # Anime API endpoints
│       └── system.js          # Updated with anime cache management
```

### Jikan Service (`backend/src/services/jikan.js`)

- **Functions**:
  - `searchAnime(query, page)` - Search anime
  - `getAnimeDetails(malId)` - Get full anime details
  - `getTopAnime(type, filter, page)` - Get top anime lists
  - `getSeasonalAnime(year, season)` - Get seasonal anime
  - `clearCache()` - Clear search cache
  - `clearAnimeCache()` - Clear details cache
  - `getCacheStats()` - Get cache statistics

- **Caching Strategy**:
  - In-memory Map-based caching
  - Anime details: 1 hour TTL
  - Search results: 15 minutes TTL
  - Automatic cache cleanup

- **Rate Limiting**:
  - Enforces 350ms minimum delay between requests
  - Prevents hitting Jikan's 3 req/s limit

### Data Source

**Jikan API**: <https://api.jikan.moe/v4>

- Unofficial MyAnimeList API
- No authentication required
- Comprehensive anime data from MyAnimeList
- Free to use with rate limits

## Example Use Cases

### 1. Search for Popular Anime

```javascript
const response = await fetch('http://localhost:3001/api/anime/search?query=attack on titan');
const data = await response.json();
console.log(data.anime[0].title); // "Shingeki no Kyojin"
```

### 2. Get Current Season's Anime

```javascript
const response = await fetch('http://localhost:3001/api/anime/season');
const data = await response.json();
console.log(`${data.season.toUpperCase()} ${data.year} Anime:`);
data.anime.forEach(anime => console.log(`- ${anime.title} (${anime.score}/10)`));
```

### 3. Get Detailed Anime Info

```javascript
const response = await fetch('http://localhost:3001/api/anime/20'); // Naruto
const data = await response.json();
console.log(`${data.title} - ${data.episodes} episodes`);
console.log(`Score: ${data.score}/10 by ${data.scoredBy.toLocaleString()} users`);
console.log(`Genres: ${data.genres.map(g => g.name).join(', ')}`);
```

## Integration with Frontend

To add anime to the frontend, you would:

1. **Create Anime Search Page** (`frontend/src/app/anime/page.tsx`)
2. **Create Anime Details Page** (`frontend/src/app/anime/[malId]/page.tsx`)
3. **Add Navigation Link** in main page
4. **Reuse Components**: Can use similar card/grid layouts as movies

Example anime card component:

```tsx
interface AnimeCardProps {
  anime: {
    malId: number
    title: string
    image: string
    score: number
    type: string
    episodes: number
  }
}

function AnimeCard({ anime }: AnimeCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <img src={anime.image} alt={anime.title} />
      <h3>{anime.title}</h3>
      <p>⭐ {anime.score}/10</p>
      <p>{anime.type} • {anime.episodes} eps</p>
    </div>
  )
}
```

## Benefits

✅ **No API Key Required** - Jikan API is free and open
✅ **Comprehensive Data** - MyAnimeList has the most complete anime database
✅ **Easy Integration** - RESTful API with JSON responses
✅ **Cached Responses** - Reduces API calls and improves performance
✅ **Rate Limiting** - Built-in respect for API limits
✅ **Full Details** - Trailers, streaming links, genres, studios, etc.

## Anime Torrent Integration 🧲

### Frontend Pages

#### **Homepage** (`/`)

- Displays a row of **Top Airing Anime** on the main page
- Shows anime poster, title, score, type, and episode count
- Click any anime card to view full details
- Data cached for 60 minutes

#### **Anime Detail Page** (`/anime/[malId]`)

Comprehensive anime information with torrent search:

**Features**:

- Full anime details from MyAnimeList
- Automatic torrent search on page load
- Alternative title search button (English vs Japanese)
- Direct qBittorrent download integration
- View torrent details before downloading

**Torrent Search**:

- Searches The Pirate Bay anime category (208)
- Shows seeders, leechers, size, upload date
- One-click download to qBittorrent
- Alternative title search if no results found

**Usage Tips**:

1. Click anime from homepage or search
2. View full details and synopsis
3. Torrents automatically searched
4. Click "Alternative Title" if no results
5. Click "Download" to add to qBittorrent

### Search Strategy

The torrent search uses smart title matching:

1. **Primary Search**: Uses original Japanese/Romaji title
2. **Alternative Search**: Uses English title if available
3. **Category Filter**: Searches only in Anime category (208)
4. **Fallback**: Manual search from homepage search bar

## Rate Limits & Best Practices

⚠️ **Jikan API Limits**:

- 3 requests per second
- 60 requests per minute
- Daily limits may apply

✅ **Best Practices**:

- Use caching aggressively (already implemented)
- Don't make parallel requests
- Respect rate limits (automatically handled)
- Consider batch operations for multiple anime

## Future Enhancements

1. ~~**Frontend UI**: Create anime browse/search pages~~ ✅ **COMPLETED**
2. ~~**Torrent Integration**: Search torrents specifically for anime~~ ✅ **COMPLETED**
3. **MyAnimeList Auth**: Optional user authentication for personalized lists
4. **Recommendations**: Anime recommendation engine based on user preferences
5. **Watch Lists**: Track anime to watch
6. **Episode Tracking**: Mark episodes as watched
7. **MAL Synchronization**: Sync watch history with MyAnimeList account
8. **Anime Search Page**: Dedicated anime search with advanced filters

## Documentation Links

- **Jikan API Docs**: <https://docs.api.jikan.moe/>
- **MyAnimeList**: <https://myanimelist.net/>
- **API Endpoint**: <https://api.jikan.moe/v4>
