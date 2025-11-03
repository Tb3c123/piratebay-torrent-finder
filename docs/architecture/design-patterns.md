# Design Patterns

## Backend Patterns

### 1. MVC Pattern (Model-View-Controller)

**Structure:**

```text
Model (Data) → Controller (Routes) → View (JSON Response)
```

**Components:**

- **Model:** Database access (SQLite), JSON file operations
- **Controller:** Route handlers, business logic, validation
- **View:** JSON responses với HTTP status codes

**Benefits:** Separation of concerns, maintainability, testability

### 2. Service Layer Pattern

**Structure:**

```text
Routes (HTTP) → Services (Logic) → External APIs/Database
```

**Services:**

- `auth.js` - Authentication, JWT generation, password hashing
- `piratebay.js` - Web scraping, torrent data extraction
- `qbittorrent.js` - qBittorrent API client, session management
- `omdb.js` - Movie API client với caching
- `torrent-parser.js` - Magnet link parsing

**Benefits:** Reusable logic, clean routes, easy testing

### 3. Middleware Chain Pattern

**Structure:**

```text
Request → helmet() → cors() → json() → morgan() → auth() → Route → Response
```

**Middleware Order:**

1. `helmet()` - Security headers
2. `cors()` - CORS validation
3. `express.json()` - Body parsing
4. `morgan()` - Request logging
5. `authenticateToken()` - JWT verification
6. Route handler - Business logic

**Authentication Middleware:**

- Extract token từ `Authorization: Bearer <token>`
- Verify JWT với secret key
- Attach user info to `req.user`
- Return 401/403 nếu invalid

**Admin Middleware:**

- Check `req.user.isAdmin`
- Return 403 nếu không phải admin

**Benefits:** Modular, reusable, clear order

### 4. Repository Pattern

**Purpose:** Abstract data access layer

**Structure:**

```text
Service → Repository → Database/Files
```

**User Repository Functions:**

- `findById(id)` - Get user by ID
- `findByUsername(username)` - Get user by username
- `create(username, hash, isAdmin)` - Create new user
- `findAll()` - Get all users

**Benefits:** Centralized data access, easy database switching

### 5. Factory Pattern

**Purpose:** Create objects với different configurations

**Settings Factory:**

- Per-user settings nếu `userId` provided
- Fallback to environment variables nếu không có
- Return consistent config object

**Benefits:** Flexible configuration, fallback mechanism

## Frontend Patterns

### 1. Context Pattern

**AuthContext:**

- Global authentication state
- User info (id, username, isAdmin)
- Login/logout functions
- Token management trong localStorage

**Usage:** `useAuth()` hook trong components

**Benefits:** No prop drilling, global state access

### 2. Component Composition Pattern

**Hierarchy:**

```text
Page → Layout → Sections → Components
```

**Example - Movie Search:**

- `HomePage` - Main container
- `SearchBar` - Input component
- `MovieGrid` - Grid layout
- `MovieCard` - Individual card

**Benefits:** Reusable components, single responsibility

### 3. Custom Hooks Pattern

**useSessionCache Hook:**

- `getCachedData(key)` - Read từ sessionStorage với TTL check
- `setCachedData(key, data, ttl)` - Write với expiry time
- `clearCache(key)` - Remove specific cache
- `clearAllCache()` - Clear all

**Benefits:** Reusable logic, clean components

### 4. Error Boundary Pattern

**ErrorBoundary Component:**

- Catch JavaScript errors trong component tree
- Display fallback UI
- Log errors to console
- Prevent app crash

**Benefits:** Graceful error handling, better UX

### 5. Module Pattern

**BurgerMenu Module:**

```text
components/BurgerMenu/
├── index.ts          # Exports
├── types.ts          # TypeScript types
├── constants.ts      # Configuration
├── utils.ts          # Helper functions
├── MainView.tsx      # Main menu
├── FullHistoryView.tsx
└── HistoryItem.tsx
```

**Benefits:** Better organization, clear boundaries, easy imports

## Cross-Cutting Patterns

### 1. Dependency Injection

**Concept:** Inject dependencies thay vì hard-code

**Example:** QBittorrentService nhận config object trong constructor thay vì hard-code URLs

**Benefits:** Flexible, testable, per-user configs

### 2. Strategy Pattern

**Search Strategies:**

- `movies` - OMDB API search
- `torrents` - Pirate Bay scraping
- `piratebay` - Direct Pirate Bay search

**Runtime Selection:** Based on search type parameter

**Benefits:** Easy to add new strategies, flexible

## Best Practices

### Code Organization

- **Separation of Concerns** - Logic, views, data tách biệt
- **Single Responsibility** - Mỗi function/component làm một việc
- **DRY Principle** - Don't Repeat Yourself
- **KISS Principle** - Keep It Simple

### Error Handling

- Always wrap async operations trong try-catch
- Return proper HTTP status codes (200, 400, 401, 403, 500)
- Log errors với context
- Display user-friendly messages

### Type Safety

- Use TypeScript interfaces cho all data structures
- Type API responses
- Avoid `any` type

### Naming Conventions

- **Components:** PascalCase (MovieCard, BurgerMenu)
- **Functions:** camelCase (handleSearch, fetchMovies)
- **Constants:** UPPER_SNAKE_CASE (API_URL, MAX_RETRIES)
- **Files:** kebab-case hoặc PascalCase cho components

## Summary

Ứng dụng sử dụng combination of proven patterns:

**Backend:**

- MVC, Service Layer, Middleware Chain, Repository, Factory

**Frontend:**

- Context, Component Composition, Custom Hooks, Error Boundary, Module

**Cross-cutting:**

- Dependency Injection, Strategy

**Benefits:**

- Clear separation of concerns
- Reusable code
- Easy testing
- Maintainability
- Scalability
