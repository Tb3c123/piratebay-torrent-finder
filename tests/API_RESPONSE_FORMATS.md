# API Response Format Documentation

This document maps backend response formats to frontend parsing requirements.

## Response Format Pattern

Backend uses consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

Frontend should ALWAYS parse: `response.data.data.*`

---

## PUBLIC ENDPOINTS

### Movies

#### GET /api/v1/movies/trending/now

```json
{
  "success": true,
  "data": {
    "movies": [{ imdbID, Title, Year, Type, Poster }, ...]
  }
}
```

**Frontend:** `response.data.data.movies`

#### GET /api/v1/movies/trending/popular

```json
{
  "success": true,
  "data": {
    "movies": [...]
  }
}
```

**Frontend:** `response.data.data.movies`

#### GET /api/v1/movies/latest

```json
{
  "success": true,
  "data": {
    "movies": [...]
  }
}
```

**Frontend:** `response.data.data.movies`

#### GET /api/v1/movies/search?query=X&page=1

```json
{
  "success": true,
  "data": {
    "success": true,
    "movies": [...],
    "totalResults": 100,
    "page": 1
  }
}
```

**Frontend:** `response.data.data.movies`

#### GET /api/v1/movies/:imdbId

```json
{
  "success": true,
  "data": {
    "movie": { Title, Year, Rated, Released, Runtime, ... }
  }
}
```

**Frontend:** `response.data.data.movie`

#### GET /api/v1/movies/:imdbId/torrents

```json
{
  "success": true,
  "data": {
    "torrents": [{ name, seeders, leechers, size, ... }, ...]
  }
}
```

**Frontend:** `response.data.data.torrents`

### Torrents

#### GET /api/v1/torrent/search?q=X&page=1

```json
{
  "success": true,
  "data": [
    { id, name, seeders, leechers, size, uploaded, ... },
    ...
  ]
}
```

**Frontend:** `response.data.data` (ARRAY directly)

#### GET /api/v1/torrent/:id

```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "...",
    "magnet": "magnet:?...",
    "seeders": 100,
    ...
  }
}
```

**Frontend:** `response.data.data`

---

## AUTHENTICATED ENDPOINTS

### Auth

#### POST /api/v1/auth/login

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 1,
      "username": "user",
      "is_admin": false,
      "created_at": "...",
      "updated_at": "..."
    }
  },
  "message": "Login successful"
}
```

**Frontend:** `response.data.data.token` and `response.data.data.user`

#### POST /api/v1/auth/register

```json
{
  "success": true,
  "data": {
    "id": 2,
    "username": "newuser",
    "is_admin": false,
    ...
  },
  "message": "User registered successfully"
}
```

**Frontend:** `response.data.data`

#### GET /api/v1/auth/me

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "user",
    "is_admin": false,
    ...
  }
}
```

**Frontend:** `response.data.data`

### Settings

#### GET /api/v1/settings

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "settings": {
      "qbittorrent": {
        "url": "http://localhost:8080",
        "username": "admin",
        "password": "***"
      }
    }
  }
}
```

**Frontend:** `response.data.data.settings`

#### PUT /api/v1/settings

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "settings": { ... }
  },
  "message": "Settings updated successfully"
}
```

**Frontend:** `response.data.data.settings`

### History

#### GET /api/v1/history

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "query": "matrix",
      "type": "movie",
      "timestamp": "...",
      "userId": 1,
      "resultCount": 5
    },
    ...
  ]
}
```

**Frontend:** `response.data.data` (ARRAY)

#### POST /api/v1/history

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "query": "matrix",
    ...
  },
  "message": "Search history saved"
}
```

**Frontend:** `response.data.data`

### Downloads

#### GET /api/v1/downloads

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "torrents": [
      {
        "hash": "abc123",
        "name": "Movie.mkv",
        "progress": 0.5,
        "state": "downloading",
        ...
      },
      ...
    ]
  }
}
```

**Frontend:** `response.data.data.torrents`

#### POST /api/v1/downloads

**Headers:** `Authorization: Bearer <token>`

```json
{
  "success": true,
  "data": {
    "message": "Torrent added successfully",
    "hash": "abc123"
  }
}
```

**Frontend:** `response.data.data`

---

## ADMIN ENDPOINTS

### GET /api/v1/auth/admin/users

**Headers:** `Authorization: Bearer <token>` (Admin only)

```json
{
  "success": true,
  "data": {
    "users": [
      { id: 1, username: "admin", is_admin: true, ... },
      ...
    ]
  }
}
```

**Frontend:** `response.data.data.users`

#### GET /api/v1/admin/logs

**Headers:** `Authorization: Bearer <token>` (Admin only)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "level": "info",
      "message": "User logged in",
      "timestamp": "...",
      ...
    },
    ...
  ]
}
```

**Frontend:** `response.data.data` (ARRAY)

---

## FRONTEND PARSING CHECKLIST

✅ **All endpoints should use:**

```typescript
// For objects with specific keys
const data = response.data.data.movies
const movie = response.data.data.movie
const settings = response.data.data.settings
const token = response.data.data.token
const user = response.data.data.user

// For arrays
const items = response.data.data // Already an array
const torrents = response.data.data.torrents

// With fallback
const movies = response.data.data?.movies || []
```

❌ **NEVER use:**

```typescript
response.data.movies  // Wrong - missing .data
response.data.movie   // Wrong - missing .data
response.movies       // Wrong - missing .data.data
```

---

## Common Patterns

### Success Response

```typescript
if (response.data.success) {
  const actualData = response.data.data
  // Use actualData
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here"
}
```

### With Message

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```
