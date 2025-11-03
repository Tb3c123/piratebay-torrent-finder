# Data Flow & Authentication

## Authentication Flow

### User Registration

**Steps:**

1. Client gửi POST `/api/auth/register` với {username, password}
2. Backend check username đã tồn tại chưa
3. Hash password với bcrypt (10 rounds)
4. Check nếu first user → assign admin = true
5. INSERT user vào database
6. Generate JWT token (payload: {id, username, isAdmin}, expiry: 7d)
7. Return {token, user} về client
8. Client lưu token vào localStorage

**First User Auto-Admin:**

- Count users trong database
- Nếu count = 0 → isAdmin = true

### User Login

**Steps:**

1. Client gửi POST `/api/auth/login` với {username, password}
2. Backend query user từ database by username
3. Compare password với stored hash dùng bcrypt
4. Nếu match: Generate JWT token và return
5. Nếu không match: Return 401 Unauthorized
6. Client lưu token vào localStorage

### Protected Route Access

**Steps:**

1. Client gửi request với header `Authorization: Bearer <token>`
2. Middleware `authenticateToken()` extract token
3. Verify token với `jwt.verify(token, SECRET)`
4. Nếu valid: Decode payload, attach vào `req.user`, continue
5. Nếu invalid/expired: Return 403 Forbidden
6. Route handler access `req.user` để get userId

## Data Flow Diagrams

### Movie Search Flow

```text
1. User Input → Search query
   ↓
2. Frontend API Call → GET /api/movies/search?query=...
   ↓
3. Backend Cache Check (5-minute TTL)
   ├─ Hit → Return cached results
   └─ Miss → Continue
   ↓
4. Backend → OMDB API request
   ↓
5. OMDB Response → Movie data
   ↓
6. Backend → Cache results, format response
   ↓
7. Frontend → Update state, render MovieCard components
   ↓
8. Save to History (if user logged in)
```

### Torrent Download Flow

```text
1. User Searches Torrent → /torrent/search
   ↓
2. Frontend → GET /api/search?query=...&category=...
   ↓
3. Backend → Pirate Bay Scraping
   - Build search URL
   - HTTP request
   - Parse HTML với Cheerio
   - Extract torrent data
   ↓
4. Response → List of torrents
   ↓
5. User Clicks Download → DownloadModal opens
   ↓
6. Load Jellyfin Libraries → GET /api/settings/jellyfin/saved-libraries
   ↓
7. User Selects Library + Save Path
   ↓
8. Frontend → POST /api/qbittorrent/add
   Body: {magnetLink, savePath, userId}
   ↓
9. Backend → Get user's qBittorrent settings
   ↓
10. Login to qBittorrent → POST /auth/login, get cookie
    ↓
11. Add Torrent → POST /torrents/add
    Headers: Cookie: SID=...
    Body: {urls: magnetLink, savepath: ...}
    ↓
12. qBittorrent → Start downloading to specified path
    ↓
13. Jellyfin → Auto-scan detects new file, adds to library
```

### Search History Flow

**Save History:**

```text
1. After Search → POST /api/history
   Body: {query, category, userId}
   ↓
2. Load search-history.json
   ↓
3. Create entry: {id: timestamp, query, category, userId, timestamp}
   ↓
4. Check duplicates → Update timestamp if exists
   ↓
5. Cleanup old entries (>30 days, >100 per user)
   ↓
6. Write to search-history.json
```

**Load History:**

```text
1. BurgerMenu Opens → GET /api/history?userId=...
   ↓
2. Load search-history.json
   ↓
3. Filter by userId
   ↓
4. Sort by timestamp (newest first)
   ↓
5. Return to frontend
   ↓
6. Display in BurgerMenu (recent 5 searches)
```

### Per-User Settings Flow

**Load Settings:**

```text
1. Navigate to /settings
   ↓
2. GET /api/settings/qbittorrent?userId=...
3. GET /api/settings/jellyfin?userId=...
   ↓
4. Load settings.json
   ↓
5. Parse: {users: {userId: {qbittorrent: {...}, jellyfin: {...}}}}
   ↓
6. Return user's settings or defaults (env vars)
   ↓
7. Frontend → Populate form fields
```

**Save Settings:**

```text
1. User Edits → Update form
   ↓
2. Test Connection (optional) → POST /api/settings/.../test
   ↓
3. Save → POST /api/settings/qbittorrent
   Body: {url, username, password, userId}
   ↓
4. Load settings.json
   ↓
5. Update: settings.users[userId].qbittorrent = {...}
   ↓
6. Write to file (atomic write với .tmp)
   ↓
7. All subsequent requests use per-user config
```

## Data Persistence

### SQLite Database

**Location:** `backend/data/users.db`

**Tables:**

- `users` - User accounts (id, username, password_hash, is_admin, timestamps)

**Operations:**

- INSERT - Create user
- SELECT - Query by id or username
- UPDATE - Update password
- DELETE - Remove user (admin only)

### JSON Files

**Location:** `backend/data/`

**1. settings.json**

```json
{
  "users": {
    "1": {
      "qbittorrent": {url, username, password},
      "jellyfin": {url, apiKey, libraries: [...]}
    }
  }
}
```

**2. search-history.json**

```json
[
  {id, query, category, userId, timestamp}
]
```

**3. logs.json**

```json
[
  {id, level, message, timestamp}
]
```

### Docker Volume Mount

**Configuration:**

```yaml
volumes:
  - ./backend/data:/app/data
```

**Benefits:**

- Data persists across container restarts
- Data persists across rebuilds
- Easy backup (copy folder)
- Easy restore (replace folder)

## Request/Response Flow

### Typical API Request

```text
1. Client Request
   - HTTP Method (GET/POST/PUT/DELETE)
   - URL + Query params/Body
   - Headers (Authorization, Content-Type)
   
2. Middleware Chain
   - helmet() → Security headers
   - cors() → CORS check
   - express.json() → Parse body
   - morgan() → Log request
   - authenticateToken() → Verify JWT
   
3. Route Handler
   - Extract data từ req
   - Validate input
   - Call service layer
   - Format response
   
4. Service Layer
   - Business logic
   - Database/file operations
   - External API calls
   
5. Response
   - Status code (200, 400, 401, 403, 500)
   - JSON body
```

### Error Flow

```text
1. Error Occurs trong try block
   ↓
2. Catch Block
   - Log error với context
   - Format error message
   ↓
3. Return Error Response
   - Status code (400/401/403/500)
   - JSON: {error: message}
   ↓
4. Frontend Error Handling
   - Display error toast/message
   - Log to console
   - Optional retry logic
```

## Summary

**Key Points:**

- JWT authentication cho stateless sessions
- Per-user data isolation (settings, history)
- Middleware chain cho request processing
- Service layer cho business logic
- Persistent storage với Docker volumes
- Error handling ở mọi layer
- Type safety với TypeScript

**Data Flow Principles:**

- Clear separation frontend/backend
- RESTful API design
- Proper HTTP methods & status codes
- JSON for all data exchange
- Token-based authentication
- Per-user configuration
