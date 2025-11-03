# Configuration Guide

## Overview

Configuration files for Docker, Node.js, Next.js, TypeScript, and Tailwind CSS. Includes development and production setups.

## Root Configuration

### `docker-compose.yml` (Development)

**Purpose:** Local development environment với hot reload

**Services:**

**backend:**

- Image: Built from `./backend/Dockerfile`
- Port: 3001:3001
- Volume mounts:
  - `./backend/src:/app/src` - Source code hot reload
  - `./backend/data:/app/data` - Persistent data
- Environment: NODE_ENV=development
- Networks: app-network
- Restart: unless-stopped
- Depends on: None (standalone)

**frontend:**

- Image: Built from `./frontend/Dockerfile`
- Port: 3000:3000
- Volume mounts:
  - `./frontend/src:/app/src` - Source code hot reload
  - `./frontend/public:/app/public` - Static files
- Environment:
  - NEXT_PUBLIC_API_URL=http://localhost:3001
- Networks: app-network
- Restart: unless-stopped
- Depends on: backend

**Networks:**

- `app-network` - Bridge network for service communication

**Commands:**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service
docker-compose restart backend

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

### `docker-compose.deploy.yml` (Production)

**Purpose:** Production deployment với optimizations

**Services:**

**backend:**

- Build:
  - Context: ./backend
  - Target: production (multi-stage build)
- Port: 3001 (internal only, not exposed)
- Volumes:
  - Named volume: `backend-data:/app/data`
- Environment:
  - NODE_ENV=production
  - JWT_SECRET=${JWT_SECRET} (from .env)
  - OMDB_API_KEY=${OMDB_API_KEY}
- Resources:
  - CPU: 0.5-1.0 cores
  - Memory: 256-512MB
- Restart: always
- Replicas: 3 (for load balancing)

**frontend:**

- Build:
  - Context: ./frontend
  - Target: production
- Port: 3000 (internal only)
- Environment:
  - NEXT_PUBLIC_API_URL=http://nginx/api
- Resources:
  - CPU: 0.5-1.0 cores
  - Memory: 256-512MB
- Restart: always

**nginx:**

- Image: nginx:alpine
- Ports: 80:80, 443:443
- Volumes:
  - `./nginx/nginx.conf:/etc/nginx/nginx.conf:ro`
  - `./nginx/ssl:/etc/nginx/ssl:ro` (SSL certificates)
- Depends on: backend, frontend
- Restart: always

**Volumes:**

- `backend-data` - Named volume for database & JSON files

**Networks:**

- `app-network` - Bridge network

**Commands:**

```bash
# Deploy
docker-compose -f docker-compose.deploy.yml up -d

# Scale backend
docker-compose -f docker-compose.deploy.yml up -d --scale backend=5

# View logs
docker-compose -f docker-compose.deploy.yml logs -f

# Stop
docker-compose -f docker-compose.deploy.yml down
```

### `.gitignore`

**Ignored Files:**

- `node_modules/` - Dependencies
- `.env` - Environment variables
- `backend/data/*.db` - Database files
- `backend/data/settings.json` - User settings (passwords)
- `.next/` - Next.js build output
- `build/` - Build artifacts
- `*.log` - Log files
- `.DS_Store` - macOS files

## Backend Configuration

### `backend/Dockerfile`

**Multi-Stage Build:**

**Stage 1: Base**

- FROM: node:18-alpine
- Install: build tools (python3, make, g++)
- User: Create nodejs user (UID 1001)

**Stage 2: Dependencies**

- Copy: package*.json
- Install: npm ci --only=production
- Copy: All production node_modules

**Stage 3: Development**

- Copy: Source code
- Install: All dependencies (dev + prod)
- Expose: Port 3001
- CMD: npm run dev (nodemon)

**Stage 4: Production**

- Copy: Only production node_modules
- Copy: Source code
- Expose: Port 3001
- USER: nodejs (non-root)
- CMD: node src/index.js

**Build:**

```bash
# Development
docker build -t jellyseer-backend:dev --target development ./backend

# Production
docker build -t jellyseer-backend:prod --target production ./backend
```

### `backend/package.json`

**Name:** jellyseer-backend

**Version:** 1.0.0

**Scripts:**

- `start` - Production: `node src/index.js`
- `dev` - Development: `nodemon src/index.js`
- `test` - Testing: `jest` (future)

**Dependencies:**

- express: ^4.18.0
- sqlite3: ^5.1.0
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.0
- axios: ^1.4.0
- cheerio: ^1.0.0-rc.12
- helmet: ^7.0.0
- cors: ^2.8.5
- morgan: ^1.10.0
- dotenv: ^16.0.0
- parse-torrent: ^11.0.0

**DevDependencies:**

- nodemon: ^3.0.0 (hot reload)

**Engines:**

- node: >=18.0.0

### `backend/.env` (Template)

**Variables:**

```env
# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-very-long-secret-key-at-least-64-characters-change-this-in-production

# APIs
OMDB_API_KEY=your-omdb-api-key

# Frontend (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Production Values:**

- Generate strong JWT_SECRET (64+ characters)
- Get OMDB API key from http://www.omdbapi.com/apikey.aspx
- Set FRONTEND_URL to production domain

## Frontend Configuration

### `frontend/Dockerfile`

**Multi-Stage Build:**

**Stage 1: Dependencies**

- FROM: node:18-alpine
- Copy: package*.json
- Install: npm ci

**Stage 2: Builder**

- Copy: Source code
- Copy: node_modules from dependencies stage
- Build: npm run build (Next.js production build)

**Stage 3: Production**

- FROM: node:18-alpine
- Copy: Built files from builder (.next/, public/)
- Copy: package*.json and node_modules
- USER: nodejs (non-root)
- Expose: Port 3000
- CMD: npm start (serve production build)

**Build:**

```bash
# Development (no build needed, use docker-compose)
docker-compose up frontend

# Production
docker build -t jellyseer-frontend:prod ./frontend
```

### `frontend/package.json`

**Name:** jellyseer-frontend

**Version:** 1.0.0

**Scripts:**

- `dev` - Development: `next dev`
- `build` - Build: `next build`
- `start` - Production: `next start`
- `lint` - Lint: `next lint`

**Dependencies:**

- next: ^14.0.0
- react: ^18.0.0
- react-dom: ^18.0.0
- typescript: ^5.0.0
- tailwindcss: ^3.3.0
- axios: ^1.4.0

**DevDependencies:**

- @types/react: ^18.0.0
- @types/node: ^20.0.0
- postcss: ^8.4.0
- autoprefixer: ^10.4.0

**Engines:**

- node: >=18.0.0

### `frontend/.env.local` (Template)

**Variables:**

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Production:**

```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

**Note:** Must use `NEXT_PUBLIC_` prefix for client-side access

### `frontend/next.config.js`

**Configuration:**

**reactStrictMode:** true - Enable React strict mode

**env:** Expose environment variables

```javascript
env: {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
}
```

**images:** External image domains

```javascript
images: {
  domains: ['m.media-amazon.com'], // OMDB poster images
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.media-amazon.com'
    }
  ]
}
```

**output:** 'standalone' (for Docker)

**compress:** true (gzip compression)

**poweredByHeader:** false (hide Next.js header)

### `frontend/tsconfig.json`

**TypeScript Configuration:**

**compilerOptions:**

- target: "ES2017"
- lib: ["dom", "dom.iterable", "esnext"]
- allowJs: true
- skipLibCheck: true
- strict: true
- noEmit: true (Next.js handles compilation)
- esModuleInterop: true
- module: "esnext"
- moduleResolution: "bundler"
- resolveJsonModule: true
- isolatedModules: true
- jsx: "preserve"
- incremental: true
- paths: {"@/*": ["./src/*"]} (path alias)

**include:** ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]

**exclude:** ["node_modules"]

### `frontend/tailwind.config.js`

**Tailwind Configuration:**

**content:** Files to scan for classes

```javascript
content: [
  './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}'
]
```

**theme.extend:** Custom theme

```javascript
colors: {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#f59e0b',
  dark: '#1f2937'
},
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif']
}
```

**plugins:** Additional plugins

```javascript
plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography')
]
```

**darkMode:** 'class' (toggle with class)

### `frontend/postcss.config.js`

**PostCSS Configuration:**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

**Purpose:** Process Tailwind CSS directives

## Nginx Configuration (Production)

### `nginx/nginx.conf`

**HTTP Server (Port 80):**

- Redirect all traffic to HTTPS

**HTTPS Server (Port 443):**

**SSL Configuration:**

- Certificate: /etc/nginx/ssl/fullchain.pem
- Private Key: /etc/nginx/ssl/privkey.pem
- Protocols: TLSv1.2 TLSv1.3
- Ciphers: Strong ciphers only
- HSTS: max-age=31536000; includeSubDomains

**Location: /api/**

- Proxy to: http://backend:3001
- Headers:
  - Host: $host
  - X-Real-IP: $remote_addr
  - X-Forwarded-For: $proxy_add_x_forwarded_for
  - X-Forwarded-Proto: $scheme
- Timeout: 60s

**Location: /**

- Proxy to: http://frontend:3000
- Headers: Same as /api/
- WebSocket support (Upgrade, Connection)

**Location: /_next/static/**

- Proxy to: http://frontend:3000
- Cache: 60 minutes
- Access log: off

**Security Headers:**

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

**Gzip Compression:**

- Enabled for: text/*, application/json, application/javascript

**Load Balancing (Future):**

```nginx
upstream backend {
  least_conn;
  server backend1:3001;
  server backend2:3001;
  server backend3:3001;
}
```

## Environment Variables

### Development

**Backend (.env):**

- PORT=3001
- NODE_ENV=development
- JWT_SECRET=dev-secret-key
- OMDB_API_KEY=xxx
- FRONTEND_URL=http://localhost:3000

**Frontend (.env.local):**

- NEXT_PUBLIC_API_URL=http://localhost:3001

### Production

**Backend (.env):**

- PORT=3001
- NODE_ENV=production
- JWT_SECRET=<64+ character random string>
- OMDB_API_KEY=<your key>
- FRONTEND_URL=https://yourdomain.com

**Frontend (.env.local):**

- NEXT_PUBLIC_API_URL=https://yourdomain.com/api

**Docker Compose (.env):**

```env
JWT_SECRET=xxx
OMDB_API_KEY=xxx
DOMAIN=yourdomain.com
```

**Loading:** docker-compose.deploy.yml reads from .env file

## Database Configuration

### SQLite (`backend/data/users.db`)

**Configuration:** No config file needed

**Location:** /app/data/users.db trong container

**Persistence:** Mounted Docker volume

**Access Mode:** Read-write (chmod 600 recommended)

**Backup:** Covered by volume backup strategy

### JSON Files

**`settings.json`:**

- Location: /app/data/settings.json
- Structure: {users: {[userId]: {qbittorrent, jellyfin}}}
- Access Mode: Read-write (chmod 600)
- Encoding: UTF-8

**`search-history.json`:**

- Location: /app/data/search-history.json
- Structure: [{id, userId, query, timestamp, results}]
- Access Mode: Read-write (chmod 644)
- Max entries: 1000 (rotation)

**`logs.json`:**

- Location: /app/data/logs.json
- Structure: [{timestamp, level, message, details}]
- Access Mode: Read-write (chmod 644)
- Max entries: 1000 (rotation)

## Build Configuration

### Development Build

**Backend:**

```bash
cd backend
npm install
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Docker:**

```bash
docker-compose up -d
```

### Production Build

**Backend:**

```bash
cd backend
npm ci --only=production
node src/index.js
```

**Frontend:**

```bash
cd frontend
npm ci
npm run build
npm start
```

**Docker:**

```bash
docker-compose -f docker-compose.deploy.yml build
docker-compose -f docker-compose.deploy.yml up -d
```

## SSL/TLS Configuration

### Let's Encrypt

**Installation:**

```bash
# Install certbot
apt-get install certbot

# Generate certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates location
/etc/letsencrypt/live/yourdomain.com/fullchain.pem
/etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Auto-Renewal:**

```bash
# Add cron job
0 0 1 * * certbot renew --quiet --post-hook "docker-compose restart nginx"
```

**Docker Volume Mount:**

```yaml
volumes:
  - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro
```

### Self-Signed (Development)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem -out fullchain.pem
```

## Configuration Summary

**Docker:**

- docker-compose.yml - Development với hot reload
- docker-compose.deploy.yml - Production với optimizations
- Multi-stage Dockerfiles - Smaller images

**Backend:**

- package.json - Dependencies & scripts
- .env - Environment variables
- No framework config (Express is minimal)

**Frontend:**

- package.json - Dependencies & scripts
- next.config.js - Next.js configuration
- tailwind.config.js - Tailwind CSS theme
- tsconfig.json - TypeScript rules
- .env.local - Environment variables

**Nginx:**

- nginx.conf - Reverse proxy, SSL, load balancing
- SSL certificates - Let's Encrypt or self-signed

**Database:**

- SQLite - No configuration needed
- JSON files - Direct file access

**Next Steps:**

- [Data Persistence](./data-persistence.md)
- [Security & Deployment](../architecture/security.md)
