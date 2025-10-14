# 📚 Documentation

> **Last Updated**: October 14, 2025
> Welcome to the Pirate Bay Torrent Finder documentation!

## �️ Documentation Structure

This documentation is organized into logical folders:

- **📁 features/** - Feature-specific documentation
- **📁 components/** - Component architecture & design
- **📁 architecture/** - System architecture & performance
- **📁 guides/** - User & development guides

---

## 📖 Quick Navigation

### 🏗️ Project Structure

- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - **Complete project map**
  - Full file tree with comments
  - Purpose of every file and folder
  - Technology stack overview
  - Update guidelines

### 🚀 Getting Started

- **[Main README](../README.md)** - Project overview and installation
- **[Usage Guide](guides/USAGE_GUIDE.md)** - Complete user guide with screenshots
- **[Anime Torrent Guide](guides/ANIME_TORRENT_GUIDE.md)** - Anime download workflow

---

## 📁 Features Documentation

Located in `features/` folder:

### Search Features

- **[Fuzzy Search](features/FUZZY_SEARCH.md)** - Advanced search with typo correction
  - Word-level typo correction (30+ words)
  - Character-level substitutions
  - Case-insensitive matching
  - Examples and testing

- **[Category Filter](features/CATEGORY_FILTER.md)** - Pirate Bay category filtering
  - 50+ categories (Audio, Video, Apps, Games, etc.)
  - Popular/All toggle view
  - Auto re-search on category change
  - Backend API integration

### Data Management

- **[Session Cache](features/SESSION_CACHE.md)** - Session storage caching
  - Persists search results on F5 refresh
  - 5-minute TTL
  - Prevents unnecessary API calls
  - Cache invalidation logic

- **[Pirate Bay History](features/PIRATE_BAY_HISTORY.md)** - Search history tracking
  - Direct Pirate Bay searches
  - History storage format
  - UI display and filtering

### Content Integration

- **[Anime Integration](features/ANIME_INTEGRATION.md)** - MyAnimeList API integration
  - Search anime database (Jikan API)
  - Top anime lists (airing, upcoming, popular)
  - Seasonal anime
  - Full anime details with trailers
  - Torrent integration for downloads
  - Cache management

### Monitoring

- **[System Logging](features/SYSTEM_LOGGING.md)** - Logging and monitoring system
  - All operations logged (success/failure)
  - Cache management tracking
  - System health monitoring
  - Error tracking and debugging
  - Log levels and filtering

---

## 🧩 Component Documentation

Located in `components/` folder:

- **[BurgerMenu](components/BURGER_MENU.md)** - Navigation menu overview
  - Original implementation
  - Feature evolution
  - Design decisions
  - See also: `frontend/src/components/BurgerMenu/README.md` for modular structure

- **[UI Unification](components/UI_UNIFICATION.md)** - Design system
  - Component patterns
  - Styling conventions
  - Consistency guidelines

---

## 🏛️ Architecture Documentation

Located in `architecture/` folder:

- **[Optimization Summary](architecture/OPTIMIZATION_SUMMARY.md)** - All optimizations
  - Complete list of improvements
  - Performance metrics
  - Before/after comparisons

- **[Performance Improvements](architecture/PERFORMANCE_IMPROVEMENTS.md)** - Detailed optimizations
  - 4-layer caching system
  - API optimization strategies
  - 99% faster load times
  - Code-level improvements

- **[Performance Testing](architecture/PERFORMANCE_TESTING.md)** - Benchmarking
  - Testing methodology
  - Load time comparisons
  - Cache hit rates
  - API call reduction stats

---

## 🎯 Quick Links

### For Users

1. [Installation Guide](../README.md#installation)
2. [Basic Usage](guides/USAGE_GUIDE.md#basic-usage)
3. [Advanced Features](../README.md#advanced-features)
4. [Troubleshooting](../README.md#troubleshooting)

### For Developers

1. [Project Structure](PROJECT_STRUCTURE.md) - Complete file tree and documentation
2. [Performance Improvements](architecture/PERFORMANCE_IMPROVEMENTS.md)
3. [Fuzzy Search Implementation](features/FUZZY_SEARCH.md#implementation-details)
4. [Testing Guide](architecture/PERFORMANCE_TESTING.md)
5. [BurgerMenu Architecture](components/BURGER_MENU.md)

## 🚀 Key Features

### 🔍 Smart Search

- **Fuzzy matching** - "breeking bad" → "Breaking Bad"
- **Multi-type** - Movies, TV series, games
- **Instant results** - 15ms with caching

### ⚡ Performance

- **99% faster** - From 5s to 50ms load times
- **4-layer cache** - OMDB, movies, torrents, sections
- **Smart caching** - 1 hour for stable data

### 🎨 User Experience

- **Colored badges** - Visual type distinction
- **Search history** - Last 30 days
- **Clear button** - Reset search easily
- **Keyboard shortcuts** - F5 shuffle, ESC clear

## 📊 Performance Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Load Time | 5000ms | 50ms | **99% faster** |
| API Calls | 20/page | 1/page | **95% reduction** |
| Cache Hit Rate | 0% | 85%+ | **New feature** |
| User Experience | Slow | Instant | **Much better** |

## 🔧 Technical Stack

- **Backend**: Node.js, Express, Axios
- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Caching**: In-memory Map with TTL
- **APIs**: OMDB, Pirate Bay
- **Docker**: Compose for easy deployment

## 📝 Documentation Updates

This documentation was last updated: **October 13, 2025**

### Recent Changes

- ✅ Added client-side shuffle (F5 only)
- ✅ Extended cache TTL to 1 hour
- ✅ Added TV shows to all sections
- ✅ Implemented fuzzy search with 30+ corrections
- ✅ Optimized performance (99% improvement)

## 🤝 Contributing

Found an issue or want to contribute?

1. Check existing documentation
2. Test thoroughly
3. Update relevant docs
4. Submit with clear description

## 📞 Support

For questions or issues:

- Check the [Usage Guide](USAGE_GUIDE.md)
- Review [Troubleshooting](../README.md#troubleshooting)
- Check [Performance docs](PERFORMANCE_IMPROVEMENTS.md)

---

**Happy torrenting!** 🏴‍☠️
