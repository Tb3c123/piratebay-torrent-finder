# Backend Structure

## Overview

Express.js API server providing authentication, movie search, torrent management, and per-user settings. Uses layered architecture với clear separation of concerns.

## Directory Structure

```
backend/
├── data/                    # Persistent data
│   ├── users.db            # SQLite database
│   ├── settings.json       # Per-user settings
│   └── search-history.json # Search history
├── scripts/
│   └── db-manager.sh       # Database utilities
└── src/
    ├── index.js            # Express app entry
    ├── database/
    │   └── init.js         # Database initialization
    ├── middleware/
    │   ├── auth.js         # JWT authentication
    │   └── admin.js        # Admin authorization
    ├── routes/             # API endpoints (10 files)
    └── services/           # Business logic (5 files)
```

## Layer Architecture

### 1. Entry Point (`index.js`)

**Responsibilities:**

- Initialize Express app
- Configure middleware (helmet, cors, morgan, body-parser)
- Initialize database
- Mount routes
- Start HTTP server on port 3001
- Global error handling

**Middleware Stack:**

1. Helmet - Security headers
2. CORS - Cross-origin configuration
3. Morgan - HTTP request logging
4. express.json() - JSON body parsing
5. Routes - API endpoints
6. Error handler - Catch-all error response

### 2. Database Layer (`database/`)

**`init.js` - Database Initialization**

**Responsibilities:**

- Create SQLite database connection
- Define users table schema
- Create table if not exists
- Run migrations

**Users Table Schema:**

- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `username` - TEXT UNIQUE NOT NULL
- `password` - TEXT NOT NULL (bcrypt hash)
- `isAdmin` - INTEGER DEFAULT 0 (0 or 1)
- `createdAt` - TEXT DEFAULT CURRENT_TIMESTAMP

**Functions:**

- `initDatabase()` - Initialize database and create tables

### 3. Middleware Layer (`middleware/`)

#### `auth.js` - Authentication Middleware

**Purpose:** Verify JWT tokens and attach user info to request

**Responsibilities:**

- Extract token from `Authorization: Bearer <token>` header
- Verify token signature với JWT_SECRET
- Decode token payload {id, username, isAdmin}
- Attach `req.user` object
- Return 401 if invalid/missing token

**Usage:** Protect routes requiring authentication

#### `admin.js` - Admin Authorization Middleware

**Purpose:** Restrict access to admin-only endpoints

**Responsibilities:**

- Check if `req.user.isAdmin === true`
- Return 403 if not admin
- Allow access if admin

**Usage:** Protect admin routes (logs, user management)

**Note:** Must use after `auth.js` middleware

### 4. Routes Layer (`routes/`)

#### `auth.js` - Authentication Routes

**Endpoints:**

- `POST /api/auth/register` - Create new user account
  - Body: {username, password}
  - Returns: {token, user: {id, username, isAdmin}}
  - First user automatically gets admin
  
- `POST /api/auth/login` - Authenticate user
  - Body: {username, password}
  - Returns: {token, user: {id, username, isAdmin}}
  - Validates password with bcrypt
  
- `GET /api/auth/verify` - Verify JWT token validity
  - Header: Authorization: Bearer <token>
  - Returns: {valid: true, user: {...}}
  - Protected by auth middleware
  
- `GET /api/auth/users` - List all users (admin only)
  - Returns: [{id, username, isAdmin, createdAt}]
  - Protected by auth + admin middleware

**Dependencies:** authService

#### `movies.js` - Movie Search Routes

**Endpoints:**

- `GET /api/movies/search` - Search movies on OMDB
  - Query: `?query=<search_term>&page=1`
  - Returns: {results: [...], totalResults, page}
  - Protected by auth
  
- `GET /api/movies/:imdbId` - Get movie details
  - Params: imdbId (e.g., tt1234567)
  - Returns: Full movie object with cast, plot, ratings
  - Protected by auth

**Dependencies:** omdbService

#### `torrent.js` - Torrent Search Routes

**Endpoints:**

- `GET /api/torrent/search` - Search torrents on Pirate Bay
  - Query: `?query=<search_term>&category=all&page=1`
  - Returns: [{title, magnet, seeders, leechers, size, uploader}]
  - Categories: all, movies, tv, anime
  - Protected by auth
  
- `GET /api/torrent/parse` - Parse torrent metadata
  - Query: `?magnetLink=<magnet_uri>`
  - Returns: {name, files: [{name, length}], totalSize}
  - Protected by auth

**Dependencies:** piratebayService, torrentParserService

#### `qbittorrent.js` - qBittorrent Management Routes

**Endpoints:**

- `POST /api/qbittorrent/add` - Add torrent to qBittorrent
  - Body: {magnetLink, category, savePath}
  - Returns: {success: true, hash}
  - Uses per-user qBittorrent settings
  - Protected by auth
  
- `GET /api/qbittorrent/torrents` - List active torrents
  - Returns: [{hash, name, progress, dlspeed, upspeed, eta, state}]
  - Protected by auth
  
- `DELETE /api/qbittorrent/torrents/:hash` - Remove torrent
  - Params: hash
  - Query: `?deleteFiles=true/false`
  - Returns: {success: true}
  - Protected by auth

**Dependencies:** qbittorrentService

#### `settings.js` - User Settings Routes

**Endpoints:**

- `GET /api/settings` - Get user's settings
  - Returns: {qbittorrent: {...}, jellyfin: {...}}
  - Per-user isolated settings
  - Protected by auth
  
- `POST /api/settings` - Update user's settings
  - Body: {qbittorrent: {...}, jellyfin: {...}}
  - Returns: {success: true, settings: {...}}
  - Validates settings structure
  - Protected by auth

**Data Structure:**

- qBittorrent: {url, username, password}
- Jellyfin: {url, apiKey}

**Storage:** JSON file với user ID isolation

#### `history.js` - Search History Routes

**Endpoints:**

- `GET /api/history` - Get user's search history
  - Returns: [{id, query, timestamp, results, userId}]
  - Filtered by user ID
  - Protected by auth
  
- `POST /api/history` - Save search to history
  - Body: {query, results}
  - Adds timestamp and userId
  - Returns: {success: true, id}
  - Protected by auth
  
- `DELETE /api/history/:id` - Delete history entry
  - Params: id
  - Verifies ownership before deleting
  - Returns: {success: true}
  - Protected by auth

**Storage:** JSON file với per-user filtering

#### `logs.js` - System Logs Routes (Admin Only)

**Endpoints:**

- `GET /api/logs` - Get system logs
  - Query: `?level=all&limit=100`
  - Levels: all, info, warn, error, debug
  - Returns: [{timestamp, level, message, details}]
  - Protected by auth + admin
  
- `POST /api/logs` - Add log entry
  - Body: {level, message, details}
  - Returns: {success: true}
  - Protected by auth + admin

**Storage:** JSON file với rotation (max 1000 entries)

#### `search.js` - Universal Search Routes

**Endpoints:**

- `POST /api/search` - Search across movies + torrents
  - Body: {query, category, page}
  - Returns: {movies: [...], torrents: [...]}
  - Calls both OMDB and Pirate Bay
  - Protected by auth

**Dependencies:** omdbService, piratebayService

#### `system.js` - System Status Routes

**Endpoints:**

- `GET /api/system/health` - Health check
  - Returns: {status: "ok", uptime, memory, database: "connected"}
  - Public endpoint (no auth)
  
- `GET /api/system/stats` - System statistics
  - Returns: {users, searches, downloads, uptime}
  - Protected by auth + admin

### 5. Services Layer (`services/`)

#### `authService.js`

**Responsibilities:** User authentication, JWT generation, password hashing

**Key Functions:**

- `register(username, password)` - Create new user
  - Hash password với bcrypt (10 salt rounds)
  - Insert into database
  - Return user object
  
- `login(username, password)` - Authenticate user
  - Fetch user from database
  - Compare password với bcrypt.compare()
  - Generate JWT token (7 days expiry)
  - Return {token, user}
  
- `generateToken(user)` - Create JWT token
  - Payload: {id, username, isAdmin}
  - Expiry: 7 days
  - Sign với JWT_SECRET
  
- `verifyToken(token)` - Verify and decode JWT
  - Verify signature
  - Check expiration
  - Return decoded payload
  
- `getAllUsers()` - Fetch all users (admin only)

**Dependencies:** bcrypt, jsonwebtoken, SQLite database

#### `omdbService.js`

**Responsibilities:** Fetch movie data from OMDB API

**Key Functions:**

- `searchMovies(query, page)` - Search movies by title
  - Calls OMDB API với `s=query&page=page`
  - Returns: {results, totalResults}
  - Requires OMDB_API_KEY
  
- `getMovieDetails(imdbId)` - Get full movie details
  - Calls OMDB API với `i=imdbId&plot=full`
  - Returns: Full movie object
  - Includes: title, year, genre, director, actors, plot, ratings, poster

**API:** http://www.omdbapi.com/

**Error Handling:** Return empty results on API errors

#### `piratebayService.js`

**Responsibilities:** Scrape torrent search results from Pirate Bay proxies

**Key Functions:**

- `searchTorrents(query, category, page)` - Search torrents
  - Scrapes Pirate Bay HTML
  - Parses title, magnet, seeders, leechers, size, uploader
  - Returns: [{title, magnet, seeders, leechers, size, uploader, uploaded}]
  
- `parseTorrentPage(html)` - Extract torrent data from HTML
  - Uses Cheerio to parse DOM
  - Extracts table rows
  - Filters out invalid entries

**Proxy URLs:** Configurable list of Pirate Bay mirrors

**Scraping:** Cheerio for HTML parsing

**Error Handling:** Try multiple proxies, return empty on failure

#### `qbittorrentService.js`

**Responsibilities:** Interact with qBittorrent Web API

**Key Functions:**

- `login(url, username, password)` - Authenticate với qBittorrent
  - Returns session cookie (SID)
  
- `addTorrent(settings, magnetLink, category, savePath)` - Add torrent
  - Login với user settings
  - POST to /api/v2/torrents/add
  - Returns: torrent hash
  
- `getTorrents(settings)` - List all torrents
  - GET /api/v2/torrents/info
  - Returns: [{hash, name, progress, state, ...}]
  
- `deleteTorrent(settings, hash, deleteFiles)` - Remove torrent
  - POST /api/v2/torrents/delete
  - Optionally delete files

**API:** qBittorrent Web API v2

**Per-User:** Uses settings from settings.json (user-specific)

#### `torrentParserService.js`

**Responsibilities:** Parse torrent metadata from magnet links

**Key Functions:**

- `parseMagnetLink(magnetUri)` - Extract torrent info
  - Fetch metadata từ DHT network
  - Returns: {name, files: [{name, length}], totalSize}
  
- `formatFileSize(bytes)` - Human-readable file sizes

**Library:** parse-torrent (or custom implementation)

**Use Case:** Preview torrent contents before downloading

## Data Persistence

### SQLite Database (`data/users.db`)

**Tables:**

- `users` - User accounts (id, username, password, isAdmin, createdAt)

**Access:** Via database/init.js module

**Backup:** Covered by Docker volume mount

### JSON Files (`data/*.json`)

**`settings.json`:**

```json
{
  "users": {
    "1": {"qbittorrent": {...}, "jellyfin": {...}},
    "2": {"qbittorrent": {...}, "jellyfin": {...}}
  }
}
```

**`search-history.json`:**

```json
[
  {"id": "uuid", "userId": 1, "query": "...", "timestamp": "...", "results": [...]}
]
```

**Access:** Direct file read/write với fs.promises

**Backup:** Covered by Docker volume mount

## API Response Format

### Success Response

**Structure:**

```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

### Error Response

**Structure:**

```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional details"
}
```

**HTTP Status Codes:**

- 200 - Success
- 201 - Created
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

## Error Handling

### Route-Level

- Try-catch blocks trong async route handlers
- Return appropriate status codes
- Log errors to console / logs.json

### Service-Level

- Throw errors with descriptive messages
- Let routes handle HTTP responses
- Log errors for debugging

### Global Error Handler

- Catch unhandled errors
- Return 500 with generic message
- Log full error stack

## Security

### Authentication Flow

1. User sends credentials to `/api/auth/login`
2. authService validates password với bcrypt
3. authService generates JWT token
4. Client stores token trong localStorage
5. Client includes token trong `Authorization` header
6. auth middleware verifies token on protected routes
7. Attach user info to `req.user`

### Authorization Flow

1. auth middleware verifies token
2. admin middleware checks `req.user.isAdmin`
3. Return 403 if not admin
4. Allow access if admin

### Data Isolation

**Per-User Settings:**

- Load settings.json
- Filter by user ID từ `req.user.id`
- Return only user's settings

**Per-User History:**

- Load search-history.json
- Filter by `userId === req.user.id`
- Return only user's history

## Environment Variables

**Required:**

- `JWT_SECRET` - JWT signing key (64+ characters)
- `OMDB_API_KEY` - OMDB API key
- `PORT` - Backend port (default: 3001)

**Optional:**

- `NODE_ENV` - Environment (development/production)

**Loading:** dotenv package loads from `.env` file

## Dependencies

### Core

- `express` - Web framework
- `sqlite3` - Database
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `axios` - HTTP client
- `cheerio` - HTML parsing

### Security

- `helmet` - Security headers
- `cors` - CORS configuration

### Utilities

- `morgan` - HTTP logging
- `dotenv` - Environment variables
- `parse-torrent` - Torrent metadata

## Development

### Starting Backend

```bash
cd backend
npm install
npm run dev  # nodemon for hot reload
```

### Testing APIs

**Tools:** Postman, curl, Thunder Client

**Base URL:** http://localhost:3001

**Example:** Search movies

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/movies/search?query=Inception"
```

## Summary

**Architecture:**

- Layered structure: Routes → Services → Database
- Clear separation of concerns
- Middleware for cross-cutting concerns

**Key Features:**

- JWT authentication
- Per-user data isolation
- Movie search (OMDB)
- Torrent search (Pirate Bay)
- qBittorrent integration
- Search history
- System logs

**Security:**

- bcrypt password hashing
- JWT tokens
- RBAC (user/admin)
- Per-user data isolation
- Helmet security headers

**Next Steps:**

- [Frontend Structure](./frontend.md)
- [Data Persistence](./data-persistence.md)
- [Configuration](./configuration.md)
