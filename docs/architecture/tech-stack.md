# Technology Stack

## Backend Stack

### Core Framework

**Express.js 4.18.2**

- Fast, minimalist web framework cho Node.js
- Middleware-based architecture
- RESTful API design
- Robust routing system

### Database & Storage

**SQLite (better-sqlite3 11.0.0)**

- Synchronous SQLite driver
- Single-file database (users.db)
- ACID compliance
- Zero configuration

**Tables:**

- `users` - User accounts (id, username, password_hash, is_admin)
- `user_credentials` - Password storage (DEPRECATED - merged vào users)
- `sessions` - Token blacklist (UNUSED - JWT stateless)

**JSON File Storage:**

- `settings.json` - Per-user qBittorrent & Jellyfin configs
- `search-history.json` - Per-user search history
- `logs.json` - System logs

### Security

**jsonwebtoken 9.0.2**

- JWT authentication
- Stateless session management
- 7-day token expiration
- Payload: {id, username, isAdmin}

**bcrypt 5.1.1**

- Password hashing với salt rounds: 10
- Resistant to rainbow table attacks
- Industry standard

**helmet 7.1.0**

- Security middleware
- Sets HTTP headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security

**cors 2.8.5**

- Cross-Origin Resource Sharing
- Configurable origin whitelist
- Credentials support

### Data Processing

**cheerio 1.0.0-rc.12**

- HTML parsing và manipulation
- jQuery-like API
- Dùng để scrape Pirate Bay

**read-torrent 1.3.1**

- Parse torrent files và magnet links
- Extract metadata
- Format conversion

**axios 1.6.2**

- HTTP client cho external APIs:
  - OMDB API (movies)
  - qBittorrent Web API
  - Jellyfin API
- Automatic JSON transformation

### Development Tools

**nodemon 3.0.2**

- Auto-restart server on file changes
- Hot reload cho development

**morgan 1.10.0**

- HTTP request logger
- Development và production modes

**dotenv 16.3.1**

- Environment variable management
- Loads từ .env file

## Frontend Stack

### Core Framework

**Next.js 14.0.4**

- React framework với App Router
- File-based routing
- Server-side rendering (SSR)
- Static site generation (SSG)
- Automatic code splitting
- Image optimization

**React 18.2.0**

- Component-based UI library
- Hooks API (useState, useEffect, useContext)
- Virtual DOM
- Concurrent features

### Styling

**Tailwind CSS 3.4.0**

- Utility-first CSS framework
- Responsive design
- JIT compiler
- Custom configuration

**PostCSS 8.4.32**

- CSS processing tool
- Autoprefixer cho browser compatibility

### Type Safety

**TypeScript 5.3.3**

- Static type checking
- Enhanced IDE support
- Better maintainability
- Compile-time error detection

**Key Interfaces:**

- Movie, MovieDetails
- Torrent
- User
- HistoryItem
- JellyfinLibrary

### HTTP Client

**Axios 1.6.2**

- Promise-based HTTP requests
- Request/response interceptors
- Automatic JSON parsing
- Error handling

## Infrastructure

### Docker

**Docker 24.x + Docker Compose**

- Container orchestration
- Isolated services
- Volume mounts cho data persistence
- Network isolation

**Services:**

- backend (Express) - Port 3001
- frontend (Next.js) - Port 3000

### Node.js Runtime

**Node.js 20 Alpine**

- JavaScript runtime trên V8 engine
- Alpine Linux cho smaller images (~150MB)
- Long-term support (LTS)

## External APIs & Services

### OMDB API

**Purpose:** Movie metadata

- Search movies by title
- Get detailed info (plot, cast, ratings)
- Poster images
- IMDb integration

### Pirate Bay

**Purpose:** Torrent search

- Web scraping với Cheerio
- Extract: name, size, seeders, leechers, magnet links

### qBittorrent Web API

**Purpose:** Torrent management

- Add torrents via magnet
- List active downloads
- Pause/resume/delete
- Set download paths
- Cookie-based authentication

### Jellyfin API

**Purpose:** Media library integration

- Fetch library list
- Get library paths
- Automatic media scanning
- API key authentication

## Dependencies Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 14.0.4 | React framework |
| UI Library | React | 18.2.0 | Component UI |
| Styling | Tailwind | 3.4.0 | CSS framework |
| Type Safety | TypeScript | 5.3.3 | Static typing |
| Backend | Express | 4.18.2 | Web server |
| Database | SQLite | 11.0.0 | Data storage |
| Auth | JWT | 9.0.2 | Token auth |
| Password | bcrypt | 5.1.1 | Hashing |
| Security | helmet | 7.1.0 | Headers |
| HTTP Client | axios | 1.6.2 | API calls |
| Parser | cheerio | 1.0.0 | HTML scraping |
| Container | Docker | 24.x | Deployment |
| Runtime | Node.js | 20 | JavaScript |

## Performance Considerations

- **Caching:** Movie search results cached 5 minutes
- **Database:** SQLite với prepared statements
- **Frontend:** Code splitting, image optimization
- **Bundle Size:** Minimized với Next.js optimization
