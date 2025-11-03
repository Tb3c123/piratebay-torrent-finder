# Architecture Overview

## System Architecture

**Pirate Bay Torrent Finder** sử dụng kiến trúc microservices với frontend (Next.js) và backend (Express.js) tách biệt, deploy bằng Docker containers.

## Core Components

### Frontend

- **Next.js 14 App Router** - File-based routing system
- **React 18** - Component-based UI library
- **TypeScript** - Type safety và autocomplete
- **Tailwind CSS** - Utility-first styling
- **AuthContext** - Global authentication state management

### Backend

- **Express.js** - REST API server framework
- **SQLite** - Relational database cho user data
- **JSON Files** - Settings và history storage
- **Middleware Chain** - Security, authentication, validation
- **Service Layer** - Business logic separation

### External Services

- **OMDB API** - Movie metadata và search
- **Pirate Bay** - Torrent search qua web scraping
- **qBittorrent** - Download management
- **Jellyfin** - Media library integration

## Key Features

### 1. Multi-User Support

- JWT authentication với 7-day expiration
- Per-user settings cho qBittorrent và Jellyfin
- Per-user search history
- Admin role management (first user = admin)

### 2. Data Isolation

- Mỗi user có settings riêng biệt
- History được filter theo userId
- Settings structure: `{users: {userId: {...}}}`

### 3. Security

- Password hashing với bcrypt (10 rounds)
- JWT token authentication
- Helmet security headers
- CORS configuration
- Protected routes với middleware

### 4. Persistent Storage

- Docker volume mounts cho data persistence
- SQLite cho user accounts
- JSON files cho settings và history
- Data tồn tại qua container rebuilds

## Architecture Patterns

- **MVC** - Model-View-Controller separation
- **Service Layer** - Business logic abstraction từ routes
- **Middleware Chain** - Sequential request processing
- **Repository** - Data access layer abstraction

## Documentation Structure

Tài liệu architecture chia thành 5 phần:

- **[tech-stack.md](./tech-stack.md)** - Chi tiết công nghệ và dependencies
- **[design-patterns.md](./design-patterns.md)** - Design patterns được sử dụng
- **[data-flow.md](./data-flow.md)** - Authentication flows và data flows
- **[security.md](./security.md)** - Security measures và deployment guide

## Quick Links

- [Project Structure](../structure/README.md)
- [Main README](../../README.md)

## Deployment Overview

### Development

```text
Frontend:3000 ←→ Backend:3001 → SQLite + JSON Files
```

### Production

```text
Nginx → Docker Network
  ├─ Frontend Container (Next.js)
  └─ Backend Container (Express) → Volume Mount (data/)
```

## Future Enhancements

- Redis caching để replace in-memory cache
- WebSocket cho real-time download progress
- PostgreSQL migration cho production scalability
- Kubernetes orchestration cho container management
- Monitoring với Prometheus + Grafana
- API rate limiting
- Multi-language support (i18n)
