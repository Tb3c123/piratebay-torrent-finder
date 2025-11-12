# Features Directory

This directory contains the feature-based architecture for the Jellyseer Clone frontend application. Each feature is organized as a self-contained module with its own components, hooks, services, and types.

## Directory Structure

```
features/
├── auth/           # Authentication & authorization
├── movies/         # Movie search & details
├── torrents/       # Torrent search & management
├── downloads/      # qBittorrent integration
├── settings/       # Application settings
├── history/        # Search history tracking
├── admin/          # User management & admin
└── shared/         # Cross-feature utilities
```

## Feature Organization Pattern

Each feature follows a consistent structure:

```
feature-name/
├── components/     # React UI components
├── hooks/          # Custom React hooks
├── services/       # API service functions
├── types/          # TypeScript interfaces
└── index.ts        # Central export file
```

### Components (`components/`)
- Presentation layer React components
- Reusable UI elements specific to the feature
- Exported through feature's `index.ts`

### Hooks (`hooks/`)
- Custom React hooks for state management
- API data fetching hooks
- Business logic encapsulation
- Example: `useAuth`, `useMovieSearch`, `useSettings`

### Services (`services/`)
- API communication functions
- Data transformation logic
- Integration with backend endpoints
- Uses the centralized API client from `lib/api`

### Types (`types/`)
- TypeScript interfaces and types
- Feature-specific data models
- Component prop types

## Features Overview

### 🔐 Auth Feature
**Purpose**: User authentication and authorization

**Components**:
- `LoginForm` - User login interface
- `RegisterForm` - New user registration
- `ProtectedRoute` - Auth-gated route wrapper

**Hooks**:
- `useAuth` - Authentication state management
- `useLogin` - Login form logic
- `useRegister` - Registration form logic

**Services**:
- `authService` - Login, register, logout API calls

### 🎬 Movies Feature
**Purpose**: Movie search and details display

**Components**:
- `MovieCard` - Movie preview card
- `MovieSearch` - Search interface
- `MovieDetails` - Detailed movie view
- `TrendingMovies` - Trending list

**Hooks**:
- `useMovieSearch` - Search functionality
- `useMovieDetails` - Movie detail fetching
- `useTrendingMovies` - Trending data

**Services**:
- `movieService` - OMDB API integration

### 🌊 Torrents Feature
**Purpose**: Torrent search and management

**Components**:
- `TorrentCard` - Torrent preview
- `TorrentSearch` - Search torrents
- `TorrentDetails` - Detailed torrent info
- `TorrentList` - List view

**Hooks**:
- `useTorrentSearch` - Search logic
- `useTorrentDetails` - Detail fetching

**Services**:
- `torrentService` - PirateBay API integration

### ⬇️ Downloads Feature
**Purpose**: qBittorrent download management

**Components**:
- `DownloadList` - Active downloads list
- `DownloadCard` - Individual download card
- `DownloadActions` - Action buttons
- `DownloadModal` - Download details modal

**Hooks**:
- `useDownloads` - Download list management
- `useDownloadActions` - Pause, resume, delete
- `useQBittorrentStatus` - Connection status

**Services**:
- `qbittorrentService` - qBittorrent API calls

### ⚙️ Settings Feature
**Purpose**: Application configuration

**Components**:
- `QBittorrentSettings` - qBittorrent config
- `JellyfinSettings` - Jellyfin integration
- `SettingsCard` - Reusable settings card

**Hooks**:
- `useSettings` - Settings state management
- `useSettingsValidation` - Form validation
- `useTestConnection` - Connection testing

**Services**:
- `settingsService` - Settings CRUD operations

### 📜 History Feature
**Purpose**: Search history tracking

**Components**:
- `HistoryList` - Search history list
- `HistoryItem` - Individual history item

**Hooks**:
- `useHistory` - History data fetching
- `useHistoryActions` - Clear, delete actions

**Services**:
- `historyService` - History API calls

### 👥 Admin Feature
**Purpose**: User and system management

**Components**:
- `UserList` - User management list
- `UserCard` - User card display
- `UserActions` - User action buttons
- `UserForm` - Create/edit user

**Hooks**:
- `useUsers` - User list management
- `useUserManagement` - CRUD operations

**Services**:
- `adminService` - Admin API endpoints

### 🔧 Shared Utilities
**Purpose**: Cross-feature utilities and constants

**Utils**:
- Date formatting helpers
- Byte size formatting
- Debounce utilities

**Hooks**:
- `useDebounce` - Debounced values
- `useLocalStorage` - localStorage integration
- `usePagination` - Pagination logic

**Constants**:
- Route definitions
- Configuration values
- App-wide constants

## Usage Guidelines

### Importing from Features

```typescript
// Import from feature
import { LoginForm, useAuth } from '@/features/auth'
import { MovieCard, useMovieSearch } from '@/features/movies'
import { DownloadList } from '@/features/downloads'

// Import shared utilities
import { formatDate, useDebounce } from '@/features/shared'
```

### Creating New Components

1. Create component file in appropriate `components/` directory
2. Create corresponding types in `types/` directory
3. Export from feature's `index.ts`
4. Use UI components from `@/components/ui`
5. Use API client from `@/lib/api`

Example:
```typescript
// features/movies/components/MovieCard.tsx
import { Card, Badge } from '@/components/ui'
import type { Movie } from '../types'

export function MovieCard({ movie }: { movie: Movie }) {
  // Component implementation
}

// features/movies/index.ts
export { MovieCard } from './components/MovieCard'
export type { Movie } from './types'
```

### Creating New Hooks

```typescript
// features/movies/hooks/useMovieSearch.ts
import { useState, useEffect } from 'react'
import { apiClient, MOVIE_ENDPOINTS } from '@/lib/api'
import type { Movie } from '../types'

export function useMovieSearch(query: string) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  
  // Hook implementation
  
  return { movies, loading }
}

// features/movies/index.ts
export { useMovieSearch } from './hooks/useMovieSearch'
```

### Creating New Services

```typescript
// features/movies/services/movieService.ts
import { apiClient, MOVIE_ENDPOINTS } from '@/lib/api'
import type { Movie, MovieSearchResponse } from '../types'

export const movieService = {
  search: async (query: string): Promise<Movie[]> => {
    const response = await apiClient.get<MovieSearchResponse>(
      MOVIE_ENDPOINTS.SEARCH,
      { params: { q: query } }
    )
    return response.data.data.movies
  },
  
  getDetails: async (imdbId: string): Promise<Movie> => {
    const response = await apiClient.get<Movie>(
      MOVIE_ENDPOINTS.DETAILS(imdbId)
    )
    return response.data
  }
}

// features/movies/index.ts
export { movieService } from './services/movieService'
```

## Migration from Pages

This feature structure supports extracting logic from monolithic page components:

**Before** (monolithic page):
```typescript
// app/settings/page.tsx - 622 lines
export default function SettingsPage() {
  // All logic, components, and state in one file
}
```

**After** (feature-based):
```typescript
// app/settings/page.tsx - ~50 lines
import { QBittorrentSettings, JellyfinSettings } from '@/features/settings'

export default function SettingsPage() {
  return (
    <div>
      <QBittorrentSettings />
      <JellyfinSettings />
    </div>
  )
}

// features/settings/components/QBittorrentSettings.tsx - ~150 lines
// features/settings/hooks/useSettings.ts - ~100 lines
// features/settings/services/settingsService.ts - ~90 lines
```

## Benefits

- ✅ **Modularity**: Self-contained, reusable features
- ✅ **Scalability**: Easy to add new features
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Testability**: Isolated units for testing
- ✅ **Developer Experience**: Predictable structure
- ✅ **Code Reusability**: Share components across pages

## Related Documentation

- UI Components: `/src/components/ui/README.md`
- API Client: `/src/lib/api/README.md`
- Architecture: `/docs/architecture/`
- Project Structure: `/docs/structure/`

## Next Steps

1. Extract authentication logic to `auth/` feature
2. Extract settings forms to `settings/` feature
3. Extract download management to `downloads/` feature
4. Extract movie components to `movies/` feature
5. Extract torrent components to `torrents/` feature

---

**Last Updated**: Phase 4 - PR #12 (Feature Folder Structure)  
**Status**: Foundation complete, ready for extraction
