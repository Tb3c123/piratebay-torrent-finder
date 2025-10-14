# Anime Torrent Integration Guide 🎌🧲

## Quick Start

### Step 1: Browse Anime on Homepage

1. Open <http://localhost:3000>
2. Scroll down to see **"🎌 Top Airing Anime"** section
3. Browse currently airing popular anime with:
   - Anime poster/cover art
   - Title (English/Japanese)
   - Score rating (⭐)
   - Type (TV/Movie/OVA/etc.)
   - Episode count

### Step 2: View Anime Details

Click on any anime card to view full details:

- **Comprehensive Information**:
  - All titles (English, Japanese, Romaji)
  - Synopsis and background
  - Studios, genres, themes, demographics
  - Airing dates and season
  - Score, rank, popularity, member count
  - Episode count and duration

- **Quick Links**:
  - "Back to Home" button
  - "View on MyAnimeList" button

### Step 3: Search & Download Torrents

**Automatic Search**:

- Torrents are automatically searched when you open an anime detail page
- Searches The Pirate Bay anime category (208)
- **Smart Search**: Tries BOTH Japanese and English titles automatically
- Uses the first title that returns results

**If No Results**:

1. Click **"🔄 Alternative Titles"** button
   - Tries all title variations (English, Japanese, Romaji)
   - Searches each one until finding results
   - Useful for anime with multiple known names

2. Click **"🔄 Refresh"** to search again with original titles

3. **Use Custom Search Box** (NEW!)
   - Type your own search query
   - Add quality: "Gundam SEED 1080p"
   - Add release group: "Gundam SEED SubsPlease"
   - Add specific keywords: "Gundam SEED COMPLETE"

**Custom Search Examples**:

- `Mobile Suit Gundam SEED 1080p` - High quality
- `Demon Slayer BluRay` - BluRay releases
- `One Piece 1000-1050` - Specific episode range
- `Attack on Titan COMPLETE` - Full season batch

**Torrent Information Displayed**:

- 🎬 Torrent title/release name
- 🌱 Seeders (green) - More seeders = faster download
- 📥 Leechers (red) - Other downloaders
- 💾 File size
- 📅 Upload date
- 👤 Uploader username

**Download Options**:

1. **📄 View Details**: See full torrent details including files list
2. **⬇️ Download**: Instantly add to qBittorrent

## Complete Workflow Example

### Example: Downloading "Kingdom Season 6"

1. **Browse**:
   - Go to homepage
   - See "Kingdom 6th Season" in Top Airing Anime (8.79 score)

2. **View Details**:
   - Click on Kingdom card
   - See full info: TV series, 26 episodes, Action/Historical genres
   - Synopsis and studio information displayed

3. **Search Torrents**:
   - Page automatically searches for "Kingdom 6th Season" torrents
   - Results show multiple releases (720p, 1080p, etc.)
   - Check seeders count (higher = better)

4. **Download**:
   - Click **"View Details"** to see files included
   - Click **"Download"** to add to qBittorrent
   - Torrent starts downloading automatically

## Tips for Best Results

### Search Tips

✅ **Good Practices**:

- Popular anime usually have many torrents available
- Currently airing anime have the most recent torrents
- Check upload date for latest episodes
- Higher seeders = faster downloads

⚠️ **If No Torrents Found**:

1. Try "Alternative Title" button (English vs Japanese)
2. Use homepage search bar with anime name + "1080p" or "720p"
3. Some anime might use different naming conventions
4. Check MyAnimeList for alternative titles

### Quality Selection

- **720p**: Good quality, smaller file size (~300-500MB per episode)
- **1080p**: Best quality, larger file size (~800MB-1.5GB per episode)
- **Batch**: Complete season in one torrent
- **WEBRip/WEB-DL**: Direct web streaming source (good quality)
- **BluRay**: Best quality but usually after anime finishes airing

### Torrent Health

- 🟢 **Excellent**: 50+ seeders
- 🟡 **Good**: 10-49 seeders
- 🟠 **Fair**: 5-9 seeders
- 🔴 **Poor**: 0-4 seeders (slow or might not complete)

## Integration Features

### Homepage Integration

- **Auto-loading**: Top airing anime loads automatically
- **Caching**: Data cached for 60 minutes
- **Smooth scrolling**: Horizontal scroll for anime cards
- **Click to detail**: Direct navigation to detail pages

### Detail Page Features

- **Auto-search**: Torrents searched on page load
- **Smart search**: Uses best available title
- **Category filter**: Searches anime-specific category
- **Direct download**: One-click qBittorrent integration
- **Detailed info**: Full MyAnimeList data

### Backend Features

- **Rate limiting**: Respects Jikan API limits (3 req/s, 60 req/min)
- **Caching system**:
  - Anime details: 60-minute cache
  - Search results: 15-minute cache
- **Error handling**: Graceful fallbacks and error messages
- **Logging**: All operations logged in System Logs

## Common Use Cases

### 1. Catching Up on Current Anime

```text
Homepage → See "Top Airing Anime" → Pick interesting anime →
View details → Download latest episodes → Enjoy!
```

### 2. Finding Specific Anime

```text
Homepage search bar → Search "Attack on Titan" →
Category: All → Find anime → Click to details →
Auto-search torrents → Download
```

### 3. Exploring New Anime

```text
Homepage → Browse Top Airing Anime section →
Read synopsis on detail page → Check score/reviews →
Download if interesting
```

## Advanced Features

### Alternative Title Search

Some anime are better known by their English names:

- "Boku no Hero Academia" → "My Hero Academia"
- "Shingeki no Kyojin" → "Attack on Titan"
- "Kimetsu no Yaiba" → "Demon Slayer"

Use the **"Alternative Title"** button to search with the other name variant.

### Manual Search Override

If auto-search doesn't find what you want:

1. Go back to homepage
2. Use search bar: `Anime Name 1080p`
3. Or: `Anime Name S01`
4. Or: `Anime Name COMPLETE`

### Batch Downloads

Look for torrents with keywords:

- "COMPLETE" - Full season
- "Batch" - Multiple episodes
- "S01.COMPLETE" - Season 1 complete

## Troubleshooting

### No Torrents Found

**Problem**: Anime detail page shows "No torrents found"

**Solutions**:

1. Click "Alternative Title" button
2. Check if anime has alternative names on MAL
3. Use homepage search with different keywords
4. Some anime might not have torrents on TPB

### Wrong Anime Torrents

**Problem**: Torrents for different anime appear

**Solutions**:

1. This can happen with common Japanese words
2. Look for torrents with episode numbers/season info
3. Check torrent title carefully before downloading
4. Use more specific search terms

### Slow Loading

**Problem**: Detail page takes time to load

**Solutions**:

1. First load fetches from Jikan API (slower)
2. Subsequent loads use cache (fast)
3. Rate limiting may cause delays
4. Check backend logs: <http://localhost:3000/logs>

## API Information

### Endpoints Used

```bash
# Get anime details
GET /api/anime/{malId}

# Search torrents (anime category)
GET /api/search?query={name}&category=208

# Add to qBittorrent
POST /api/qbittorrent/add
Body: { "magnetLink": "magnet:..." }
```

### Cache Management

View and clear anime cache in System Logs:

1. Go to <http://localhost:3000/logs>
2. Scroll to "Cache Management"
3. See anime cache stats
4. Clear if needed (forces fresh data)

## Related Documentation

- **[Anime Integration](ANIME_INTEGRATION.md)** - Complete API documentation
- **[Usage Guide](USAGE_GUIDE.md)** - General app usage
- **[Performance](PERFORMANCE_IMPROVEMENTS.md)** - Performance details

## Support

For issues or questions:

1. Check **System Logs**: <http://localhost:3000/logs>
2. Review **backend logs**: `docker logs piratebay-backend`
3. Review **frontend logs**: `docker logs piratebay-frontend`
4. Check Jikan API status: <https://status.jikan.moe/>

---

**Happy anime watching! 🎌🍿**
