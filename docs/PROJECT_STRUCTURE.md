# Project Structure Documentation

> **Last Updated**: October 14, 2025
> **Auto-update Rule**: Update this file whenever adding/removing/moving files or folders

## Overview

Pirate Bay Torrent Finder is a full-stack web application for searching movies/TV shows and managing torrent downloads via qBittorrent integration.

## Technology Stack

### Frontend

- **Framework**: Next.js 14.2.33 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: JavaScript
- **APIs**: OMDB, Jikan (MyAnimeList), Pirate Bay scraper

### Infrastructure

- **Containerization**: Docker & Docker Compose
- **Deployment**: CasaOS compatible
- **External Integration**: qBittorrent Web API

---

## Project Root Structure

```
jellyseer-clone/
├── .github/                    # GitHub configuration
│   └── copilot-instructions.md # Copilot project context
│
├── backend/                    # Backend service (Node.js/Express)
│   ├── src/                   # Source code
│   ├── data/                  # Persistent data
│   ├── Dockerfile             # Backend container config
│   └── package.json           # Backend dependencies
│
├── frontend/                   # Frontend service (Next.js)
│   ├── src/                   # Source code
│   ├── public/                # Static assets
│   ├── Dockerfile             # Frontend container config
│   ├── package.json           # Frontend dependencies
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   └── tsconfig.json          # TypeScript config
│
├── docs/                       # Project documentation
│   ├── README.md              # Documentation index (this file links)
│   ├── PROJECT_STRUCTURE.md   # This file - project structure map
│   ├── features/              # Feature documentation
│   ├── components/            # Component documentation
│   ├── architecture/          # Architecture & performance docs
│   └── guides/                # User & development guides
│
├── docker-compose.yml          # Multi-container orchestration
├── package.json                # Root workspace config
└── README.md                   # Project overview
```

---

## Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── index.js               # Express server entry point
│   │                          # - Initializes Express app
│   │                          # - Sets up middleware (CORS, JSON parser)
│   │                          # - Mounts route handlers
│   │                          # - Starts HTTP server on port 3001
│   │
│   ├── routes/                # API route handlers
│   │   ├── anime.js           # Anime search via Jikan API
│   │   │                      # GET /api/anime/search?q={query}
│   │   │                      # GET /api/anime/:malId
│   │   │
│   │   ├── history.js         # Search history management
│   │   │                      # GET /api/history (fetch all)
│   │   │                      # POST /api/history (add entry)
│   │   │                      # DELETE /api/history (clear all)
│   │   │
│   │   ├── logs.js            # System logs
│   │   │                      # GET /api/logs?level={info|warn|error}
│   │   │
│   │   ├── movies.js          # Movie search via OMDB
│   │   │                      # GET /api/movies/search?q={query}
│   │   │                      # GET /api/movies/:imdbId
│   │   │
│   │   ├── qbittorrent.js     # qBittorrent integration
│   │   │                      # POST /api/qbittorrent/add (add torrent)
│   │   │                      # GET /api/qbittorrent/status
│   │   │
│   │   ├── search.js          # Direct Pirate Bay search
│   │   │                      # GET /api/search?query={q}&category={cat}
│   │   │
│   │   ├── system.js          # System status
│   │   │                      # GET /api/system/status
│   │   │
│   │   └── torrent.js         # Torrent search orchestration
│   │                          # GET /api/torrent/search (movie + torrents)
│   │                          # GET /api/torrent/:id (torrent details)
│   │
│   └── services/              # Business logic & external APIs
│       ├── jikan.js           # Jikan API client (MyAnimeList)
│       │                      # - Search anime by query
│       │                      # - Fetch anime details by MAL ID
│       │
│       ├── omdb.js            # OMDB API client
│       │                      # - Search movies by title
│       │                      # - Fetch movie details by IMDB ID
│       │                      # - Requires API key
│       │
│       ├── piratebay.js       # Pirate Bay scraper
│       │                      # - Search torrents by query + category
│       │                      # - Parse HTML results
│       │                      # - Extract magnet links, seeders, leechers
│       │
│       ├── qbittorrent.js     # qBittorrent Web API client
│       │                      # - Authenticate with qBittorrent
│       │                      # - Add magnet links
│       │                      # - Monitor download status
│       │
│       └── torrent-parser.js  # Torrent metadata parser
│                              # - Parse torrent file metadata
│                              # - Extract info hash, trackers
│
├── data/
│   └── search-history.json    # Persistent search history storage
│                              # Auto-created if not exists
│
├── Dockerfile                 # Backend Docker image
│                              # - Base: node:20-alpine
│                              # - Installs production dependencies
│                              # - Runs npm start
│
└── package.json               # Backend dependencies
                               # - express, axios, cors
                               # - cheerio (HTML parsing)
                               # - dotenv (environment variables)
```

---

## Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── globals.css        # Global styles + Tailwind imports
│   │   ├── layout.tsx         # Root layout (wraps all pages)
│   │   │                      # - Sets up <html>, <body>
│   │   │                      # - Includes global header/footer
│   │   │                      # - Wraps with ErrorBoundary
│   │   │
│   │   ├── page.tsx           # Homepage (/)
│   │   │                      # - Search bar for movies
│   │   │                      # - Movie results grid
│   │   │                      # - Toggle movie/pirate search
│   │   │
│   │   ├── anime/             # Anime pages
│   │   │   └── [malId]/
│   │   │       └── page.tsx   # Anime details (/anime/{malId})
│   │   │                      # - Fetches from Jikan API
│   │   │                      # - Shows synopsis, rating, episodes
│   │   │                      # - Torrent search for anime
│   │   │
│   │   ├── history/           # Search history
│   │   │   └── page.tsx       # Full history page (/history)
│   │   │                      # - Infinite scroll (20 items/page)
│   │   │                      # - Grouped by date
│   │   │                      # - Clear all functionality
│   │   │
│   │   ├── logs/              # System logs
│   │   │   └── page.tsx       # Logs viewer (/logs)
│   │   │                      # - Real-time log streaming
│   │   │                      # - Filter by level (info/warn/error)
│   │   │                      # - Auto-scroll to bottom
│   │   │
│   │   ├── movie/             # Movie pages
│   │   │   └── [imdbId]/
│   │   │       └── page.tsx   # Movie details (/movie/{imdbId})
│   │   │                      # - Fetches from OMDB API
│   │   │                      # - Shows plot, cast, ratings
│   │   │                      # - Torrent search for movie
│   │   │
│   │   ├── movies/            # Movie list
│   │   │   └── page.tsx       # Browse movies (/movies)
│   │   │                      # - Grid view of movies
│   │   │                      # - Pagination
│   │   │
│   │   └── torrent/           # Torrent pages
│   │       ├── [id]/
│   │       │   └── page.tsx   # Torrent details (/torrent/{id})
│   │       │                  # - Show magnet link
│   │       │                  # - Download button
│   │       │                  # - Send to qBittorrent
│   │       │
│   │       └── search/
│   │           └── page.tsx   # Direct torrent search (/torrent/search)
│   │                          # - Direct Pirate Bay search
│   │                          # - Category filter (50+ categories)
│   │                          # - Results with seeders/leechers
│   │
│   ├── components/            # React components
│   │   ├── BurgerMenu.tsx     # Main navigation menu
│   │   │                      # - Sidebar overlay menu
│   │   │                      # - Two views: main & full history
│   │   │                      # - System navigation links
│   │   │                      # See: components/BurgerMenu/ for modular structure
│   │   │
│   │   ├── BurgerMenu/        # BurgerMenu module (refactored)
│   │   │   ├── README.md      # Module quick reference
│   │   │   ├── index.ts       # Central exports
│   │   │   ├── types.ts       # TypeScript types
│   │   │   ├── constants.ts   # Configuration values
│   │   │   ├── utils.ts       # Helper functions
│   │   │   ├── HistoryItem.tsx # History item component
│   │   │   ├── MainView.tsx   # Main menu view
│   │   │   └── FullHistoryView.tsx # Full history view
│   │   │
│   │   ├── CategoryFilter.tsx # Pirate Bay category filter
│   │   │                      # - 50+ categories with icons
│   │   │                      # - Popular/All toggle
│   │   │                      # - Grid layout
│   │   │
│   │   ├── ErrorBoundary.tsx  # React error boundary
│   │   │                      # - Catches render errors
│   │   │                      # - Shows fallback UI
│   │   │
│   │   ├── GlobalKeyHandler.tsx # Keyboard shortcuts
│   │   │                      # - Ctrl+K: Open search
│   │   │                      # - Esc: Close modals
│   │   │
│   │   ├── Header.tsx         # Page header
│   │   │                      # - Site logo
│   │   │                      # - Navigation links
│   │   │                      # - Burger menu button
│   │   │
│   │   ├── MovieCard.tsx      # Movie card component
│   │   │                      # - Poster image
│   │   │                      # - Title, year, rating
│   │   │                      # - Click to details
│   │   │
│   │   ├── SearchBar.tsx      # Search input component
│   │   │                      # - Auto-complete
│   │   │                      # - Search history
│   │   │                      # - Fuzzy search
│   │   │
│   │   ├── SearchHistory.tsx  # Search history dropdown
│   │   │                      # - Recent 5 searches
│   │   │                      # - Click to re-search
│   │   │
│   │   └── TorrentResults.tsx # Torrent results list
│   │                          # - Tabular display
│   │                          # - Sortable columns
│   │                          # - Magnet link copy
│   │
│   ├── hooks/                 # Custom React hooks
│   │   └── useSessionCache.ts # Session storage caching
│   │                          # - Persists search results
│   │                          # - Auto-restore on F5
│   │                          # - TTL: 5 minutes
│   │
│   └── lib/                   # Utility libraries
│       ├── types.ts           # Global TypeScript types
│       │                      # - Movie, Torrent, Anime types
│       │                      # - API response types
│       │
│       └── torrent/           # Torrent search utilities
│           ├── index.ts       # Main exports
│           ├── anime-search.ts # Anime torrent search logic
│           ├── movie-search.ts # Movie torrent search logic
│           └── search.ts      # Base search functions
│
├── public/                    # Static assets
│   └── (images, icons, etc.)
│
├── Dockerfile                 # Frontend Docker image
│                              # - Multi-stage build
│                              # - Build: npm run build
│                              # - Run: node server.js
│
├── package.json               # Frontend dependencies
│                              # - next, react, react-dom
│                              # - typescript, tailwindcss
│                              # - axios
│
├── next.config.js             # Next.js configuration
│                              # - Standalone output
│                              # - Image optimization
│
├── tailwind.config.js         # Tailwind CSS configuration
│                              # - Custom colors
│                              # - Dark theme
│
└── tsconfig.json              # TypeScript configuration
                               # - Strict mode
                               # - Path aliases (@/*)
```

---

## Documentation Structure (`/docs`)

```
docs/
├── README.md                  # Documentation index & navigation
│                              # - Links to all documentation
│                              # - Quick reference guide
│
├── PROJECT_STRUCTURE.md       # **THIS FILE** - Project structure map
│                              # - Complete file tree
│                              # - Purpose of each file/folder
│                              # - Technology stack overview
│
├── features/                  # Feature-specific documentation
│   ├── ANIME_INTEGRATION.md   # Anime search integration
│   │                          # - Jikan API usage
│   │                          # - Anime details display
│   │                          # - Anime torrent search
│   │
│   ├── CATEGORY_FILTER.md     # Pirate Bay category filtering
│   │                          # - 50+ category definitions
│   │                          # - UI implementation
│   │                          # - Backend integration
│   │
│   ├── FUZZY_SEARCH.md        # Fuzzy search implementation
│   │                          # - Algorithm explanation
│   │                          # - Use cases
│   │                          # - Performance considerations
│   │
│   ├── PIRATE_BAY_HISTORY.md  # Pirate Bay search history
│   │                          # - Direct search tracking
│   │                          # - History storage format
│   │                          # - UI display
│   │
│   ├── SESSION_CACHE.md       # Session caching system
│   │                          # - SessionStorage usage
│   │                          # - Cache invalidation
│   │                          # - F5 refresh persistence
│   │
│   └── SYSTEM_LOGGING.md      # System logging feature
│                              # - Log levels (info/warn/error)
│                              # - Log viewer UI
│                              # - Real-time streaming
│
├── components/                # Component documentation
│   ├── BURGER_MENU.md         # BurgerMenu overview (legacy)
│   │                          # - Original implementation notes
│   │                          # - Feature evolution
│   │
│   └── UI_UNIFICATION.md      # UI consistency guide
│                              # - Design system
│                              # - Component patterns
│                              # - Styling conventions
│
├── architecture/              # Architecture & performance docs
│   ├── OPTIMIZATION_SUMMARY.md # Performance optimization summary
│   │                          # - All optimizations applied
│   │                          # - Performance metrics
│   │                          # - Before/after comparisons
│   │
│   ├── PERFORMANCE_IMPROVEMENTS.md # Performance improvement details
│   │                          # - Code-level optimizations
│   │                          # - Caching strategies
│   │                          # - Bundle size reduction
│   │
│   └── PERFORMANCE_TESTING.md # Performance testing guide
│                              # - Testing methodology
│                              # - Benchmarking tools
│                              # - Performance baselines
│
└── guides/                    # User & development guides
    ├── ANIME_TORRENT_GUIDE.md # Guide: Searching anime torrents
    │                          # - Step-by-step workflow
    │                          # - Best practices
    │                          # - Troubleshooting
    │
    └── USAGE_GUIDE.md         # General usage guide
                               # - Getting started
                               # - Feature walkthrough
                               # - FAQ
```

---

## Key File Purposes

### Configuration Files (Root)

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Multi-container orchestration (frontend + backend) |
| `.github/copilot-instructions.md` | Project context for GitHub Copilot |
| `package.json` | Root workspace configuration |
| `README.md` | Project overview and quick start |

### Backend Key Files

| File | Purpose |
|------|---------|
| `src/index.js` | Express server entry point, middleware setup |
| `src/routes/*.js` | API endpoint handlers (movies, anime, torrents, etc.) |
| `src/services/*.js` | External API clients and business logic |
| `data/search-history.json` | Persistent search history storage |

### Frontend Key Files

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout wrapper for all pages |
| `src/app/page.tsx` | Homepage with search functionality |
| `src/components/BurgerMenu.tsx` | Main navigation menu component |
| `src/hooks/useSessionCache.ts` | Session storage caching hook |
| `src/lib/types.ts` | Global TypeScript type definitions |

---

## Update Guidelines

### When to Update This File

1. **Adding new files/folders** → Update structure tree
2. **Moving files** → Update paths in structure
3. **Removing files** → Remove from structure
4. **Changing file purpose** → Update comments
5. **New major features** → Add to relevant section

### How to Update

1. Find the relevant section (Backend/Frontend/Docs)
2. Update the tree structure
3. Update the comments explaining purpose
4. Update the "Last Updated" date at the top
5. Commit with message: `docs: Update PROJECT_STRUCTURE.md - [what changed]`

### Maintenance Checklist

- [ ] Structure tree matches actual folders
- [ ] All key files are documented
- [ ] Comments explain file purposes
- [ ] Links to related docs are correct
- [ ] "Last Updated" date is current

---

## Related Documentation

- [Documentation Index](./README.md) - Central documentation hub
- [Usage Guide](./guides/USAGE_GUIDE.md) - How to use the application
- [BurgerMenu Structure](../frontend/src/components/BurgerMenu/README.md) - Component details

---

**Remember**: Keep this file updated whenever you change the project structure!
