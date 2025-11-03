# Project Structure Overview

## Directory Layout

```
jellyseer-clone/
├── backend/               # Express.js API server
│   ├── data/             # Persistent data (SQLite, JSON)
│   ├── src/              # Source code
│   │   ├── database/     # Database initialization
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API endpoints
│   │   └── services/     # Business logic
│   └── scripts/          # Utility scripts
├── frontend/             # Next.js application
│   └── src/
│       ├── app/          # App Router pages
│       ├── components/   # React components
│       ├── contexts/     # React contexts
│       ├── hooks/        # Custom hooks
│       └── lib/          # Utilities & types
└── docs/                 # Documentation
    ├── architecture/     # System design
    └── structure/        # Code organization
```

## Key Directories

### Backend (`/backend`)

**Purpose:** Express.js API server providing authentication, movie search, torrent management, and settings

**Key Subdirectories:**

- `data/` - SQLite database, JSON files, user data
- `src/database/` - Database schema & initialization
- `src/middleware/` - Auth, admin, error handling
- `src/routes/` - API endpoints (10 route files)
- `src/services/` - Business logic (5 service files)
- `scripts/` - Database utilities

**Technologies:** Express, SQLite, JWT, bcrypt, Axios, Cheerio

### Frontend (`/frontend`)

**Purpose:** Next.js web application với App Router, React components, Tailwind CSS

**Key Subdirectories:**

- `src/app/` - Pages & layouts (App Router)
- `src/components/` - Reusable components (15+ components)
- `src/contexts/` - Global state (AuthContext)
- `src/hooks/` - Custom hooks (useSessionCache)
- `src/lib/` - Utilities, types, API helpers

**Technologies:** Next.js 14+, React 18+, TypeScript, Tailwind CSS

### Documentation (`/docs`)

**Purpose:** Comprehensive project documentation

**Subdirectories:**

- `architecture/` - System design, patterns, data flow, security
- `structure/` - Code organization, backend/frontend structure, configuration

## Navigation Guide

### For New Developers

**Start Here:**

1. [Architecture Overview](../architecture/README.md) - Understand system design
2. [Tech Stack](../architecture/tech-stack.md) - Technologies used
3. [Backend Structure](./backend.md) - API organization
4. [Frontend Structure](./frontend.md) - UI organization

**Deep Dive:**

- [Design Patterns](../architecture/design-patterns.md) - Code patterns
- [Data Flow](../architecture/data-flow.md) - Request/response flow
- [Security](../architecture/security.md) - Authentication & deployment

### For Feature Development

**Backend Features:**

- [Backend Structure](./backend.md) - Routes, services, middleware
- [Data Persistence](./data-persistence.md) - Database & storage
- [Configuration](./configuration.md) - Environment & settings

**Frontend Features:**

- [Frontend Structure](./frontend.md) - Pages, components, hooks
- [Configuration](./configuration.md) - Next.js config

### For Deployment

- [Security & Deployment](../architecture/security.md) - Production setup
- [Configuration Guide](./configuration.md) - Docker, environment vars
- [Data Persistence](./data-persistence.md) - Backups, volumes

## File Naming Conventions

### Backend

**Routes:** `<resource>.js` - e.g., `movies.js`, `torrent.js`
**Services:** `<service-name>.js` - e.g., `omdb.js`, `qbittorrent.js`
**Middleware:** `<purpose>.js` - e.g., `auth.js`, `admin.js`

### Frontend

**Pages:** `page.tsx` - App Router convention
**Components:** `PascalCase.tsx` - e.g., `MovieCard.tsx`, `SearchBar.tsx`
**Hooks:** `use<Name>.ts` - e.g., `useSessionCache.ts`
**Types:** `types.ts` - Shared TypeScript types
**Utilities:** `<name>.ts` - e.g., `auth.ts`, `search.ts`

## Module Organization

### Backend Layers

1. **Routes** (`src/routes/`) - HTTP endpoints
2. **Services** (`src/services/`) - Business logic
3. **Database** (`src/database/`) - Data access
4. **Middleware** (`src/middleware/`) - Cross-cutting concerns

**Flow:** Routes → Services → Database

### Frontend Layers

1. **Pages** (`src/app/`) - Routes & layouts
2. **Components** (`src/components/`) - UI building blocks
3. **Contexts** (`src/contexts/`) - Global state
4. **Hooks** (`src/hooks/`) - Reusable logic
5. **Lib** (`src/lib/`) - Utilities

**Flow:** Pages → Components → Hooks → API

## Data Flow Overview

**Typical Request:**

1. User interacts with Frontend component
2. Component calls API via fetch/axios
3. Backend route receives request
4. Middleware validates authentication
5. Route calls service function
6. Service interacts with database/external APIs
7. Service returns data to route
8. Route sends response to frontend
9. Component updates UI

**Detailed Flow:** See [Data Flow](../architecture/data-flow.md)

## Configuration Files

### Backend

- `package.json` - Dependencies & scripts
- `.env` - Environment variables (gitignored)
- `Dockerfile` - Container build
- `data/settings.json` - User settings (gitignored)

### Frontend

- `package.json` - Dependencies & scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.js` - Tailwind CSS config
- `tsconfig.json` - TypeScript config
- `.env.local` - Environment variables (gitignored)

### Root

- `docker-compose.yml` - Development setup
- `docker-compose.deploy.yml` - Production setup

**Details:** See [Configuration](./configuration.md)

## Key Files

### Backend Entry

- `backend/src/index.js` - Express app initialization
- `backend/src/database/init.js` - Database setup

### Frontend Entry

- `frontend/src/app/layout.tsx` - Root layout
- `frontend/src/app/page.tsx` - Home page

### Documentation

- `docs/architecture/README.md` - Architecture overview
- `docs/structure/README.md` - This file

## Development Workflow

### Starting Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Project Structure Best Practices

**Separation of Concerns:**

- Routes handle HTTP only
- Services contain business logic
- Database layer handles data access
- Components are pure UI

**Modularity:**

- Each route/service has single responsibility
- Components are reusable
- Utilities are shared across modules

**Consistency:**

- Follow naming conventions
- Maintain folder structure
- Keep similar files together

## Summary

**Project Layout:**

- **Backend:** Express.js API trong `/backend`
- **Frontend:** Next.js app trong `/frontend`
- **Documentation:** Detailed docs trong `/docs`

**Organization:**

- Modular structure với clear separation
- Layered architecture (routes → services → database)
- Consistent naming conventions

**Navigation:**

- Start với architecture overview
- Deep dive với structure docs
- Reference configuration for setup

**Next Steps:**

- [Backend Structure](./backend.md) - API details
- [Frontend Structure](./frontend.md) - UI details
- [Configuration](./configuration.md) - Setup details
