# Frontend Structure

## Overview

Next.js 14+ application với App Router, TypeScript, Tailwind CSS. Provides movie search, torrent download, user authentication, and per-user settings management.

## Directory Structure

```text
frontend/
└── src/
    ├── app/                  # App Router pages & layouts
    │   ├── layout.tsx       # Root layout
    │   ├── page.tsx         # Home page
    │   ├── globals.css      # Global styles
    │   ├── admin/           # Admin dashboard
    │   ├── auth/            # Auth pages (login, register)
    │   ├── downloads/       # Active downloads
    │   ├── history/         # Search history
    │   ├── logs/            # System logs (admin)
    │   ├── movie/[imdbId]/  # Movie details
    │   ├── movies/          # Movie search
    │   ├── settings/        # User settings
    │   └── torrent/         # Torrent search & details
    ├── components/          # Reusable components
    │   ├── BurgerMenu/      # Modular menu component
    │   └── torrent/         # Torrent-specific components
    ├── contexts/            # React contexts
    │   └── AuthContext.tsx
    ├── hooks/               # Custom hooks
    │   └── useSessionCache.ts
    └── lib/                 # Utilities & types
        ├── auth.ts
        ├── types.ts
        └── torrent/
```

## App Router Structure

### Root Layout (`app/layout.tsx`)

**Purpose:** Global layout wrapping all pages

**Features:**

- HTML/body structure
- Global CSS import
- Font configuration (Inter)
- AuthProvider wrapper
- Metadata (title, description)
- Header component
- GlobalKeyHandler for keyboard shortcuts

### Home Page (`app/page.tsx`)

**Route:** `/`

**Features:**

- Hero section with app description
- Quick action buttons (Search Movies, Browse Torrents)
- Popular searches display
- Recent activity (if logged in)
- Getting started guide

### Movie Search (`app/movies/page.tsx`)

**Route:** `/movies`

**Features:**

- SearchBar component
- MovieCard grid display
- Pagination
- Loading states
- Error handling

**Data Flow:**

1. User enters search query
2. Fetch `/api/movies/search?query=...`
3. Display results với MovieCard components
4. Click card → Navigate to `/movie/[imdbId]`

### Movie Details (`app/movie/[imdbId]/page.tsx`)

**Route:** `/movie/tt1234567`

**Features:**

- Full movie information (poster, plot, cast, ratings)
- "Search Torrents" button
- Related movies (future)
- Add to watchlist (future)

**Data Flow:**

1. Extract imdbId from URL params
2. Fetch `/api/movies/:imdbId`
3. Display movie details
4. Click "Search Torrents" → Navigate to `/torrent/search?query=<title>`

### Torrent Search (`app/torrent/search/page.tsx`)

**Route:** `/torrent/search?query=...&category=all`

**Features:**

- SearchBar with category filter
- TorrentList component
- Seeders/leechers display
- Size, uploader info
- "Download" button for each torrent
- Pagination

**Data Flow:**

1. User enters search query
2. Select category (all, movies, tv, anime)
3. Fetch `/api/torrent/search?query=...&category=...`
4. Display results với TorrentList
5. Click "Download" → Open DownloadModal

### Torrent Details (`app/torrent/[id]/page.tsx`)

**Route:** `/torrent/abc123`

**Features:**

- Torrent metadata
- File list với sizes
- Download button
- Alternative search suggestions (AlternativeSearch component)

**Data Flow:**

1. Extract torrent ID from URL
2. Fetch torrent metadata (parse magnet link)
3. Display file structure
4. Download → Send to qBittorrent

### Downloads (`app/downloads/page.tsx`)

**Route:** `/downloads`

**Features:**

- Active torrent list
- Progress bars
- Download/upload speeds
- ETA
- Pause/resume/delete controls
- Real-time updates (polling or WebSocket)

**Data Flow:**

1. Fetch `/api/qbittorrent/torrents`
2. Display với progress info
3. Poll every 2 seconds for updates
4. Control actions → POST to qBittorrent API

### Search History (`app/history/page.tsx`)

**Route:** `/history`

**Features:**

- SearchHistory component
- List of past searches
- Click to re-run search
- Delete individual entries
- Clear all history

**Data Flow:**

1. Fetch `/api/history`
2. Display với SearchHistory component
3. Click entry → Navigate to search results
4. Delete → DELETE `/api/history/:id`

### User Settings (`app/settings/page.tsx`)

**Route:** `/settings`

**Features:**

- qBittorrent configuration (URL, username, password)
- Jellyfin configuration (URL, API key)
- Save/test settings
- Success/error notifications

**Data Flow:**

1. Fetch `/api/settings`
2. Display settings form
3. User edits settings
4. Click "Save" → POST `/api/settings`
5. Show success/error message

### Authentication Pages

#### Login (`app/auth/login/page.tsx`)

**Route:** `/auth/login`

**Features:**

- Username/password form
- Submit → POST `/api/auth/login`
- Store JWT token trong localStorage
- Redirect to home or previous page
- Link to register page

#### Register (`app/auth/register/page.tsx`)

**Route:** `/auth/register`

**Features:**

- Username/password form
- Password confirmation
- Submit → POST `/api/auth/register`
- Auto-login after registration
- First user becomes admin
- Link to login page

### Admin Pages

#### Logs (`app/logs/page.tsx`)

**Route:** `/logs` (admin only)

**Features:**

- System log viewer
- Filter by level (all, info, warn, error, debug)
- Limit results
- Real-time log updates
- Log entry details (timestamp, message, stack trace)

**Data Flow:**

1. Fetch `/api/logs?level=all&limit=100`
2. Display trong table format
3. Auto-refresh every 5 seconds
4. Click entry → Expand details

#### Admin Dashboard (`app/admin/page.tsx`)

**Route:** `/admin` (admin only)

**Features:**

- System statistics (users, searches, downloads)
- User management (future)
- System health
- Database management (future)

## Components

### Core Components

#### `Header.tsx`

**Purpose:** Global navigation bar

**Features:**

- App logo/title
- Navigation links (Movies, Torrents, Downloads, History, Settings)
- User menu (logout, profile)
- Admin menu (logs, admin dashboard)
- Mobile responsive (hamburger menu)
- BurgerMenu integration

**State:** Uses AuthContext for user info

#### `SearchBar.tsx`

**Purpose:** Universal search input

**Props:**

- `onSearch(query)` - Callback with search query
- `placeholder` - Input placeholder
- `defaultValue` - Initial value
- `autoFocus` - Focus on mount

**Features:**

- Text input với submit button
- Enter key submits
- Loading indicator
- Clear button
- Keyboard shortcuts (Ctrl+K focus)

#### `MovieCard.tsx`

**Purpose:** Display movie trong grid/list

**Props:**

- `movie` - Movie object {title, poster, year, imdbId}
- `onClick` - Click handler

**Features:**

- Poster image với fallback
- Title, year, rating display
- Hover effects
- Responsive design (grid layout)
- Link to movie details page

#### `CategoryFilter.tsx`

**Purpose:** Torrent category selector

**Props:**

- `selected` - Current category
- `onChange(category)` - Callback

**Categories:**

- All
- Movies
- TV Shows
- Anime
- Music
- Games
- Software

**Features:**

- Button group style
- Active state highlighting
- Mobile responsive

#### `DownloadModal.tsx`

**Purpose:** Confirm torrent download

**Props:**

- `torrent` - Torrent object {title, magnet, size}
- `onConfirm(category, savePath)` - Download callback
- `onCancel` - Close modal

**Features:**

- Display torrent info
- Category selector (dropdown)
- Save path input (optional)
- Confirm/cancel buttons
- Modal overlay (click outside to close)

#### `SearchHistory.tsx`

**Purpose:** Display search history list

**Props:**

- `history` - Array of history entries
- `onSelect(entry)` - Click handler
- `onDelete(id)` - Delete handler

**Features:**

- List view với timestamps
- Click to re-run search
- Delete button per entry
- Empty state message
- Recent searches first (sorted by timestamp)

#### `ErrorBoundary.tsx`

**Purpose:** Catch React errors globally

**Features:**

- Wrap app trong layout
- Display error UI on crash
- Log errors to console
- "Try Again" button (reset error)
- Production vs development messages

#### `GlobalKeyHandler.tsx`

**Purpose:** Global keyboard shortcuts

**Shortcuts:**

- `Ctrl+K` / `Cmd+K` - Focus search bar
- `Ctrl+H` / `Cmd+H` - Navigate to history
- `Ctrl+D` / `Cmd+D` - Navigate to downloads
- `Escape` - Close modals

**Implementation:** useEffect với addEventListener

### Torrent Components

#### `torrent/TorrentList.tsx`

**Purpose:** Display torrent search results

**Props:**

- `torrents` - Array of torrent objects
- `onDownload(torrent)` - Download handler

**Features:**

- Table view với sortable columns
- Columns: Title, Seeders, Leechers, Size, Uploader, Uploaded
- Download button per row
- Empty state message
- Loading skeleton

#### `torrent/TorrentSection.tsx`

**Purpose:** Torrent details section wrapper

**Props:**

- `title` - Section title
- `children` - Content

**Features:**

- Consistent section styling
- Collapsible (future)
- Icon support

#### `torrent/AlternativeSearch.tsx`

**Purpose:** Suggest alternative torrent searches

**Props:**

- `originalQuery` - Original search term

**Features:**

- Generate variations (e.g., "Movie 2023", "Movie 1080p")
- Display as clickable chips
- Click → Navigate to search với new query

### BurgerMenu Components

**Modular structure trong `components/BurgerMenu/`:**

#### `index.ts` - Barrel export

#### `MainView.tsx` - Main menu view

**Features:**

- Navigation links
- User info display
- Recent searches preview
- Switch to FullHistoryView

#### `FullHistoryView.tsx` - Full history view

**Features:**

- Complete search history
- Delete functionality
- Back to MainView button

#### `HistoryItem.tsx` - Individual history entry

**Props:**

- `entry` - History object
- `onSelect` - Click handler
- `onDelete` - Delete handler

#### `constants.ts` - Menu constants

#### `types.ts` - TypeScript types

#### `utils.ts` - Helper functions

## Contexts

### `AuthContext.tsx`

**Purpose:** Global authentication state

**Provides:**

- `user` - Current user object {id, username, isAdmin} or null
- `token` - JWT token string or null
- `login(token, user)` - Set auth state
- `logout()` - Clear auth state
- `isAuthenticated` - Boolean
- `isAdmin` - Boolean

**Storage:** localStorage for persistence

**Initialization:** Check localStorage on mount, verify token với `/api/auth/verify`

**Usage:** Wrap app trong layout, useContext trong components

## Hooks

### `useSessionCache.ts`

**Purpose:** Cache API responses trong sessionStorage

**Returns:**

- `getCached(key)` - Get cached data
- `setCached(key, data, ttl)` - Store với TTL
- `clearCache(key)` - Remove specific key
- `clearAllCache()` - Clear all cache

**Use Cases:**

- Movie search results (avoid duplicate API calls)
- Torrent search results
- User settings
- Search history

**TTL:** Configurable per cache entry (default: 5 minutes)

**Storage:** sessionStorage (cleared on tab close)

## Lib/Utilities

### `lib/auth.ts`

**Functions:**

- `getToken()` - Get JWT from localStorage
- `setToken(token)` - Store JWT trong localStorage
- `removeToken()` - Clear JWT
- `isAuthenticated()` - Check if token exists
- `getAuthHeaders()` - Return {Authorization: `Bearer ${token}`}

**Usage:** API calls, protected routes

### `lib/types.ts`

**TypeScript Types:**

- `User` - {id, username, isAdmin}
- `Movie` - OMDB movie object
- `Torrent` - Torrent search result
- `SearchHistoryEntry` - History object
- `Settings` - User settings object

**Exports:** Shared across components

### `lib/torrent/`

#### `search.ts` - Universal torrent search

**Functions:**

- `searchTorrents(query, category, page)` - Call API
- `formatTorrentResults(data)` - Transform response

#### `movie-search.ts` - Movie torrent search helper

**Functions:**

- `searchMovieTorrents(movieTitle, year)` - Movie-specific search
- `filterQuality(torrents, quality)` - Filter by quality (1080p, 720p, etc.)

#### `anime-search.ts` - Anime torrent search helper

**Functions:**

- `searchAnimeTorrents(title, episode)` - Anime-specific search
- `parseEpisode(title)` - Extract episode number

## Styling

### Tailwind CSS

**Configuration:** `tailwind.config.js`

**Custom Theme:**

- Colors: Primary, secondary, accent, dark theme
- Fonts: Inter (sans-serif)
- Spacing: Custom spacing scale
- Breakpoints: Mobile-first responsive

**Usage:** Utility classes trong JSX

### Global Styles (`globals.css`)

**Includes:**

- Tailwind directives (@tailwind base, components, utilities)
- Custom CSS variables
- Dark mode styles
- Scrollbar styling
- Animation keyframes

## State Management

### Local State

**useState:** Component-level state (forms, toggles, loading)

### Global State

**AuthContext:** Authentication state (user, token)

### Server State

**Data Fetching:** Direct fetch/axios calls (no library like React Query yet)

**Caching:** useSessionCache hook

**Future:** Consider React Query or SWR for server state

## Routing

### App Router

**File-based Routing:** Next.js convention

**Examples:**

- `app/page.tsx` → `/`
- `app/movies/page.tsx` → `/movies`
- `app/movie/[imdbId]/page.tsx` → `/movie/:imdbId`

**Navigation:**

- `<Link href="/...">` - Next.js Link component
- `useRouter()` - Programmatic navigation

### Protected Routes

**Implementation:** Check authentication trong page components

**Pattern:**

1. useContext(AuthContext)
2. If not authenticated → redirect to `/auth/login`
3. If not admin (for admin pages) → redirect to `/`

**Example:** Downloads, Settings, Logs pages

## Data Fetching

### Client-Side Fetching

**Pattern:** fetch API với getAuthHeaders()

**Loading States:** useState với loading boolean

**Error Handling:** try-catch, display error messages

### API Routes (Future)

**Next.js API Routes:** Could use `/app/api/` for proxy/server-side logic

**Current:** Direct calls to Express backend

## Configuration

### `next.config.js`

**Key Settings:**

- `reactStrictMode: true` - Enable strict mode
- `env: {NEXT_PUBLIC_API_URL}` - Backend API URL
- `images: {domains: [...]}` - External image domains (OMDB posters)

### `tsconfig.json`

**TypeScript Configuration:**

- Strict mode enabled
- Path aliases (@/ for src/)
- JSX: preserve (Next.js handles)

### `tailwind.config.js`

**Tailwind Configuration:**

- Content paths (scan src/ for classes)
- Custom theme extension
- Plugins (forms, typography)

### Environment Variables

**`.env.local` (gitignored):**

- `NEXT_PUBLIC_API_URL` - Backend URL (`http://localhost:3001`)

**Note:** NEXT_PUBLIC_ prefix for client-side access

## Development

### Starting Frontend

```bash
cd frontend
npm install
npm run dev  # Next.js dev server
```

**URL:** `http://localhost:3000`

### Building for Production

```bash
npm run build  # Create optimized build
npm start      # Serve production build
```

## Summary

**Architecture:**

- Next.js 14+ App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Component-based structure

**Key Features:**

- Movie search & details
- Torrent search & download
- User authentication
- Per-user settings
- Search history
- Admin dashboard

**Patterns:**

- Context for global state
- Custom hooks for reusable logic
- Modular components (BurgerMenu structure)
- File-based routing (App Router)
- Client-side data fetching

**Next Steps:**

- [Configuration](./configuration.md)
- [Data Persistence](./data-persistence.md)
- [Architecture Overview](../architecture/README.md)
