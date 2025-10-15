# 🏴‍☠️ Pirate Bay Torrent Finder

A Docker-based web application similar to Jellyseerr for searching movies and TV shows on The Pirate Bay and integrating with qBittorrent for downloads. Designed to run on CasaOS and other Docker environments.

## Features

- 🔍 **Search torrents** on The Pirate Bay using official API
- 🎯 **Smart Fuzzy Search** - Find movies even with typos (e.g., "breeking bad" → "Breaking Bad")
- 📺 **Multi-type search** - Movies, TV series, games, and more
- 🎨 **Colored badges** - Visual distinction between content types
- 📜 **Search history** (saved for 30 days)
- ⬇️ **One-click download** to qBittorrent
- 📊 **System logs viewer** with filtering
- 🔄 **Backend/Frontend restart** controls
- **Docker ready** - Easy deployment
- 🎨 **Modern UI** with Tailwind CSS
- 🚀 **CasaOS compatible**
- 🎯 **Auto-sorted by seeders** for best results
- ⚡ **Performance optimized** - 4-layer caching system (99% faster)

## Technology Stack

- **Backend**: Node.js with Express
- **Frontend**: Next.js with React and Tailwind CSS
- **Container**: Docker and Docker Compose
- **Integration**: qBittorrent Web API

## Prerequisites

- Docker and Docker Compose installed
- qBittorrent with Web UI enabled
- CasaOS (optional, for easy management)

## Installation

### 🚀 Quick Deploy (Không cần pull code - Như cài app)

**Chỉ cần 2 file, không cần clone repo! Docker sẽ tự build từ GitHub.**

```bash
# 1. Tải docker-compose.deploy.yml
wget https://raw.githubusercontent.com/Tb3c123/piratebay-torrent-finder/main/docker-compose.deploy.yml

# 2. Tải file .env mẫu
wget https://raw.githubusercontent.com/Tb3c123/piratebay-torrent-finder/main/.env.deploy -O .env

# 3. Sửa .env với thông tin của bạn
nano .env

# 4. Build và chạy (Docker sẽ tự động clone và build từ GitHub)
docker-compose -f docker-compose.deploy.yml up -d --build
```

**Done!** Mở <http://localhost:3000> để sử dụng app.

> **Cách hoạt động:** Docker Compose sẽ tự động:
>
> 1. Clone code từ GitHub repository
> 2. Build backend và frontend images
> 3. Khởi chạy containers
>
> **Không cần Docker Hub, không cần pull code thủ công!**

**Dành cho CasaOS/Unraid/Portainer:**

- Import file `docker-compose.deploy.yml` vào App Store
- Điền environment variables trong UI
- Click Install → Docker sẽ tự build từ GitHub!

---

### Quick Setup (Recommended)

**One centralized `.env` file - Simple and easy!**

```bash
# 1. Clone the repository
git clone https://github.com/Tb3c123/piratebay-torrent-finder.git
cd piratebay-torrent-finder

# 2. Copy and configure ONE environment file
cp .env.example .env

# 3. Edit .env with your settings (all variables in one place!)
nano .env

# 4. Start with Docker
docker-compose up -d
```

**Done!** Open <http://localhost:3000> to use the app.

---

### Detailed Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd "Jellyseer Clone"
```

### 2. Configure environment variables

**NEW: All configuration in ONE file!**

```bash
cp .env.example .env
nano .env
```

Key settings to configure in `.env`:

```env
# OMDB API Key (for movie metadata)
OMDB_API_KEY=your_key_here

# qBittorrent Configuration
QBITTORRENT_URL=http://your-qbittorrent-host:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=your-password

# Optional: Change ports if needed
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

> **Note**: The old setup with separate `backend/.env` and `frontend/.env` files still works, but using the centralized `.env` file is now recommended!

### 3. Build and run with Docker Compose

```bash
docker-compose up -d
```

### 4. Access the application

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:3001>

## CasaOS Installation

1. Open CasaOS App Store
2. Click "Install a customized app"
3. Upload or paste the `docker-compose.yml` file
4. Configure environment variables in CasaOS UI or create a `.env` file:
   - `OMDB_API_KEY` - Get free key at <http://www.omdbapi.com/apikey.aspx>
   - `QBITTORRENT_URL`, `QBITTORRENT_USERNAME`, `QBITTORRENT_PASSWORD`
   - Optional: `FRONTEND_PORT`, `BACKEND_PORT`
5. Click "Install"

## Advanced Features

### 🔍 Enhanced Fuzzy Search

The application includes an intelligent fuzzy search that automatically corrects typos and finds movies/series even with spelling mistakes.

**Examples:**

- `breeking bad` → Finds "Breaking Bad" ✅
- `how i meet your mother` → Finds "How I Met Your Mother" ✅
- `spyder man` → Finds "Spider-Man" ✅
- `barbi movie` → Finds "Barbie" ✅

**How it works:**

1. Tries exact match first
2. Applies case variations
3. Corrects common typos (30+ corrections)
4. Applies character-level substitutions (c↔k, b↔p, etc.)
5. Caches successful searches

📖 See [docs/FUZZY_SEARCH.md](docs/FUZZY_SEARCH.md) for detailed documentation.

### ⚡ Performance Optimization

4-layer caching system for ultra-fast responses:

- **Layer 1**: OMDB API results (15 min)
- **Layer 2**: Movie details (1 hour)
- **Layer 3**: Torrent listings (5 min)
- **Layer 4**: Trending sections (1 hour)

**Results:** 99% faster load times, API usage reduced by 95%

📖 See [docs/PERFORMANCE_IMPROVEMENTS.md](docs/PERFORMANCE_IMPROVEMENTS.md) for details.

## Development

### Install dependencies

```bash
npm run install:all
```

### Run in development mode

```bash
npm run dev
```

This will start both backend and frontend in development mode:

- Backend: <http://localhost:3001>
- Frontend: <http://localhost:3000>

### Backend only

```bash
cd backend
npm install
npm run dev
```

### Frontend only

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Search Torrents

```
GET /api/search?query=<search-term>&category=<category-id>
```

Categories:

- `0`: All
- `200`: Video
- `201`: Movies
- `202`: TV Shows
- `100`: Audio
- `300`: Applications
- `400`: Games

### Add Torrent to qBittorrent

```
POST /api/qbittorrent/add
Content-Type: application/json

{
  "magnetLink": "magnet:?xt=urn:btih:...",
  "savePath": "/downloads" (optional)
}
```

### Get qBittorrent Status

```
GET /api/qbittorrent/status
```

## Configuration

### qBittorrent Setup

1. Enable Web UI in qBittorrent:
   - Tools → Options → Web UI
   - Check "Enable the Web User Interface"
   - Set username and password
   - Note the port (default: 8080)

2. Configure the application to connect to qBittorrent:
   - Update `QBITTORRENT_URL` in `.env`
   - Set `QBITTORRENT_USERNAME` and `QBITTORRENT_PASSWORD`

### The Pirate Bay Mirror

If the main The Pirate Bay domain is blocked, you can use a mirror:

```env
PIRATEBAY_URL=https://thepiratebay.org
# Or use a mirror
PIRATEBAY_URL=https://tpb.party
```

## Project Structure

```
.
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── index.js        # Main server file
│   │   ├── routes/         # API routes
│   │   │   ├── search.js   # Search routes
│   │   │   └── qbittorrent.js  # qBittorrent routes
│   │   └── services/       # Business logic
│   │       ├── piratebay.js    # PirateBay scraper
│   │       └── qbittorrent.js  # qBittorrent API client
│   ├── Dockerfile
│   └── package.json
├── frontend/               # Next.js/React frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   │   ├── page.tsx   # Main page
│   │   │   ├── layout.tsx # Layout component
│   │   │   └── globals.css
│   │   └── components/    # React components
│   │       ├── SearchBar.tsx
│   │       └── TorrentResults.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Docker Compose configuration
├── .env.example           # Example environment variables
└── README.md              # This file
```

## Troubleshooting

### Cannot connect to qBittorrent

1. Verify qBittorrent Web UI is enabled
2. Check the URL, username, and password in `.env`
3. Ensure qBittorrent is accessible from the Docker container
4. If running in Docker, use the Docker network name or host IP

### Search not working

1. Check if The Pirate Bay is accessible
2. Try using a mirror site in `PIRATEBAY_URL`
3. Check backend logs: `docker-compose logs backend`

### Frontend cannot connect to backend

1. Verify `NEXT_PUBLIC_API_URL` in frontend `.env`
2. If running in Docker, use the backend service name: `http://backend:3001`
3. If running locally, use: `http://localhost:3001`

## 📚 Documentation

Comprehensive documentation is available in the `docs/` folder:

- **[Usage Guide](docs/USAGE_GUIDE.md)** - How to use all features
- **[Fuzzy Search](docs/FUZZY_SEARCH.md)** - Advanced search with typo correction
- **[Performance](docs/PERFORMANCE_IMPROVEMENTS.md)** - Caching & optimization details
- **[Performance Testing](docs/PERFORMANCE_TESTING.md)** - Benchmarks and testing
- **[Optimization Summary](docs/OPTIMIZATION_SUMMARY.md)** - Complete optimization overview

## Security Notes

⚠️ **Important Security Considerations:**

1. This application scrapes The Pirate Bay, which may be illegal in some jurisdictions
2. Always use a VPN when accessing torrent sites
3. Change default qBittorrent credentials
4. Do not expose this application to the public internet without proper security measures
5. Use HTTPS in production with a reverse proxy like Nginx

## License

MIT License - Feel free to use and modify as needed.

## Disclaimer

This tool is for educational purposes only. The developers are not responsible for any misuse of this software. Always respect copyright laws and use torrents legally.
