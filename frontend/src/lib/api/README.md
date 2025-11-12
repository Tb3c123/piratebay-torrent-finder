# API Client Library

Centralized API client for making HTTP requests to the backend with automatic authentication, error handling, and retry logic.

## Features

- ✅ **Axios-based** HTTP client with TypeScript support
- ✅ **Automatic token injection** from localStorage
- ✅ **Request/Response interceptors** for logging and error handling
- ✅ **Retry logic** with exponential backoff for failed requests
- ✅ **Error standardization** with user-friendly messages
- ✅ **Type-safe** API endpoints and responses
- ✅ **Development logging** for debugging

## Usage

### Basic Request

```typescript
import { apiClient, MOVIE_ENDPOINTS } from '@/lib/api'

// GET request
const response = await apiClient.get(MOVIE_ENDPOINTS.SEARCH, {
  params: { query: 'Inception', page: 1 }
})

// POST request
const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
  username: 'user',
  password: 'pass'
})
```

### With Types

```typescript
import { apiClient, MOVIE_ENDPOINTS, type MovieSearchResponse } from '@/lib/api'

const response = await apiClient.get<MovieSearchResponse>(
  MOVIE_ENDPOINTS.SEARCH,
  { params: { query: 'Matrix' } }
)

const movies = response.data.data.movies // Fully typed!
```

### Error Handling

```typescript
import { apiClient, getErrorMessage, isAuthError } from '@/lib/api'

try {
  const response = await apiClient.get('/api/v1/movies/search')
} catch (error) {
  const message = getErrorMessage(error)
  console.error('Search failed:', message)
  
  if (isAuthError(error)) {
    // Redirect to login
  }
}
```

### Authentication

```typescript
import { setAuthToken, clearAuthToken, isAuthenticated } from '@/lib/api'

// After login
setAuthToken(response.data.data.token)

// Check auth status
if (isAuthenticated()) {
  // User is logged in
}

// Logout
clearAuthToken()
```

## API Endpoints

All endpoints are organized by feature:

```typescript
import { API_ENDPOINTS } from '@/lib/api'

// Auth
API_ENDPOINTS.AUTH.LOGIN
API_ENDPOINTS.AUTH.REGISTER
API_ENDPOINTS.AUTH.LOGOUT

// Movies
API_ENDPOINTS.MOVIES.SEARCH
API_ENDPOINTS.MOVIES.DETAILS(imdbId)
API_ENDPOINTS.MOVIES.TRENDING_POPULAR

// Torrents
API_ENDPOINTS.TORRENTS.SEARCH
API_ENDPOINTS.TORRENTS.DETAILS(id)

// qBittorrent
API_ENDPOINTS.QBITTORRENT.ADD
API_ENDPOINTS.QBITTORRENT.STATUS
API_ENDPOINTS.QBITTORRENT.PAUSE(hash)

// Settings
API_ENDPOINTS.SETTINGS.QBITTORRENT_GET
API_ENDPOINTS.SETTINGS.JELLYFIN_GET

// History
API_ENDPOINTS.HISTORY.GET_ALL
API_ENDPOINTS.HISTORY.CREATE

// Logs
API_ENDPOINTS.LOGS.GET_ALL
API_ENDPOINTS.LOGS.GET_STATUS

// System
API_ENDPOINTS.SYSTEM.HEALTH
API_ENDPOINTS.SYSTEM.CACHE_STATS
```

## Request Interceptor

Automatically:

- Adds `Authorization: Bearer <token>` header
- Logs requests in development mode
- Tracks request timing

## Response Interceptor

Automatically:

- Logs responses in development mode
- Handles 401 errors (redirects to login)
- Implements retry logic for failed requests
- Standardizes error messages

## Retry Logic

Automatically retries requests that fail with:

- Network errors
- Timeout errors (408)
- Rate limit errors (429)
- Server errors (500, 502, 503, 504)

Uses exponential backoff:

- 1st retry: 1 second
- 2nd retry: 2 seconds
- 3rd retry: 4 seconds
- Max: 10 seconds

## Types

All API types are defined in `types.ts`:

```typescript
import type {
  ApiResponse,
  MovieSearchResponse,
  TorrentSearchResponse,
  QBittorrentSettings,
  AuthResponse,
  User,
} from '@/lib/api'
```

## Error Utilities

```typescript
import {
  getErrorMessage,    // Extract user-friendly error message
  createApiError,     // Create standardized error object
  isAuthError,        // Check if error is 401/403
  isNetworkError,     // Check if error is network-related
  shouldRetry,        // Check if request should be retried
} from '@/lib/api'
```

## Configuration

Base URL is configured from environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Default timeout: 30 seconds

## Development Mode

In development, the client logs:

- All requests with method, URL, params, and data
- All responses with status, duration, and data
- All errors with details

Disable by setting `NODE_ENV=production`

## Example: Search Movies

```typescript
import { apiClient, MOVIE_ENDPOINTS, getErrorMessage } from '@/lib/api'
import type { MovieSearchResponse } from '@/lib/api'

async function searchMovies(query: string) {
  try {
    const response = await apiClient.get<MovieSearchResponse>(
      MOVIE_ENDPOINTS.SEARCH,
      { params: { query, page: 1 } }
    )
    
    return response.data.data.movies
  } catch (error) {
    console.error('Movie search failed:', getErrorMessage(error))
    throw error
  }
}
```

## Example: Add Torrent

```typescript
import { apiClient, QBITTORRENT_ENDPOINTS } from '@/lib/api'
import type { AddTorrentRequest, AddTorrentResponse } from '@/lib/api'

async function addTorrent(magnetLink: string) {
  const response = await apiClient.post<AddTorrentResponse>(
    QBITTORRENT_ENDPOINTS.ADD,
    { magnetLink } as AddTorrentRequest
  )
  
  return response.data
}
```
