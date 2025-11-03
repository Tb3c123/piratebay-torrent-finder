# 🏴‍☠️ Pirate Bay Torrent Finder

A modern, Docker-based web application for searching torrents on The Pirate Bay and downloading them directly to qBittorrent, with Jellyfin integration for media library management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Features

- 🔍 **Movie Search**: Search movies via OMDB API with rich metadata
- 🏴‍☠️ **Torrent Search**: Direct Pirate Bay torrent search with category filters
- ⬇️ **One-Click Download**: Download torrents directly to qBittorrent
- 📚 **Jellyfin Integration**: Auto-organize downloads into Jellyfin media libraries
- 📜 **Search History**: Per-user search history with quick re-search
- 🎯 **Smart Categories**: Filter torrents by Movies, TV Shows, Music, Games, etc.

### User Management

- 🔐 **Authentication**: JWT-based user authentication
- 👤 **Per-User Settings**: Individual qBittorrent and Jellyfin configurations
- 📊 **Per-User History**: Isolated search history for each user
- 🔒 **Admin Panel**: User management and system monitoring

### Advanced Features

- 🎬 **Trending Movies**: Display trending, popular, and latest movies
- 🔄 **Infinite Scroll**: Load more results seamlessly
- 📱 **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- 🌙 **Dark Theme**: Beautiful dark mode UI
- 🍔 **Burger Menu**: Quick access to history, settings, and logs
- ⚡ **Fast Search**: Cached movie data for instant results

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: SQLite3 (better-sqlite3)
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Web Scraping**: Cheerio
- **HTTP Client**: Axios
- **Security**: Helmet, CORS
- **Logging**: Morgan + custom logging system

### Frontend

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext)
- **HTTP Client**: Axios
- **UI Components**: Custom components with responsive design

### Infrastructure

- **Containerization**: Docker + Docker Compose
- **Proxy**: Nginx (optional)
- **Process Manager**: PM2 (development)
- **Hot Reload**: Nodemon (backend), Next.js Fast Refresh (frontend)

## 📦 Prerequisites

- Docker & Docker Compose
- qBittorrent with Web UI enabled
- (Optional) Jellyfin Media Server
- (Optional) OMDB API Key (free tier available)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Tb3c123/piratebay-torrent-finder.git
cd piratebay-torrent-finder
```

### 2. Environment Configuration

Create `.env` file in the root directory:

```env
# Backend Configuration
PORT=3001
BACKEND_PORT=3001

# Frontend Configuration
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# qBittorrent Configuration
QBITTORRENT_URL=http://localhost:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminadmin

# OMDB API (Optional - for movie metadata)
OMDB_API_KEY=your_api_key_here

# Jellyfin (Optional - for media library integration)
JELLYFIN_URL=http://localhost:8096
JELLYFIN_API_KEY=your_jellyfin_api_key

# Pirate Bay Configuration
PIRATEBAY_URL=https://thepiratebay.org
```

### 3. Docker Deployment

```bash
# Build and start containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Application will be available at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:3001>

## ⚙️ Configuration

### First-Time Setup

1. **Register an Account**
   - Navigate to <http://localhost:3000/auth/register>
   - Create your first user account
   - First user is automatically admin

2. **Configure qBittorrent**
   - Go to Settings page
   - Enter qBittorrent Web UI URL, username, and password
   - Test connection before saving

3. **Configure Jellyfin (Optional)**
   - Go to Settings page
   - Enter Jellyfin server URL and API key
   - Click "Test & Load Libraries"
   - Save configuration

### qBittorrent Setup

Enable Web UI in qBittorrent:

1. Open qBittorrent
2. Go to Tools → Options → Web UI
3. Enable "Web User Interface (Remote control)"
4. Set port (default: 8080)
5. Set username and password
6. (Optional) Enable "Bypass authentication for clients on localhost"

### Jellyfin API Key

1. Open Jellyfin web interface
2. Go to Dashboard → API Keys
3. Click "+" to create new API key
4. Name it "Pirate Bay Torrent Finder"
5. Copy the generated key

## 📖 Usage

### Movie Search

1. **Homepage Movie Search**
   - Enter movie name in search bar
   - Select "Movie Search" mode
   - Click Search or press Enter
   - Browse results and click on a movie

2. **Movie Detail Page**
   - View movie information (plot, cast, ratings)
   - Click "🔍 Find Torrents" to search Pirate Bay
   - Select quality and download

### Direct Torrent Search

1. **Direct Pirate Bay Search**
   - Enter search query
   - Select "Direct Pirate Bay" mode
   - Choose category (All, Movies, TV, Music, etc.)
   - Browse torrent results

2. **Download Torrent**
   - Click "Download" button on any torrent
   - Select Jellyfin library destination
   - Torrent is added to qBittorrent automatically

### Search History

- Click burger menu (☰) in top-left corner
- View recent searches
- Click any history item to re-search
- Access full history page for all searches
- Clear history if needed

### Downloads Management

- Navigate to Downloads page
- View all active torrents in qBittorrent
- Pause/Resume/Delete torrents
- Monitor download progress in real-time

### System Logs

- Go to Logs page (via burger menu)
- View system events and errors
- Filter by log level (INFO, WARN, ERROR)
- Clear logs if needed

## 🐳 Docker Deployment

### Production Deployment

Use `docker-compose.deploy.yml` for production:

```bash
docker-compose -f docker-compose.deploy.yml up -d
```

### Data Persistence

Data is persisted in Docker volumes:

- `./backend/data:/app/src/data` - User database, search history, settings

Important files:

- `users.db` - SQLite database with user accounts
- `search-history.json` - Per-user search history
- `settings.json` - Per-user settings (qBittorrent, Jellyfin)

### Backup

```bash
# Backup data directory
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data/

# Restore from backup
tar -xzf backup-YYYYMMDD.tar.gz
```

## 💻 Development

### Local Development Setup

```bash
# Install all dependencies
npm run install:all

# Run both backend and frontend in dev mode
npm run dev

# Or run separately
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

### Backend Development

```bash
cd backend
npm install
npm run dev  # Nodemon with hot reload
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev  # Next.js with Fast Refresh
```

### Project Structure

```
piratebay-torrent-finder/
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── database/     # SQLite database initialization
│   │   ├── middleware/   # Auth & admin middleware
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── index.js      # Server entry point
│   └── data/             # Persistent data (mounted volume)
│
├── frontend/             # Next.js 14 React app
│   ├── src/
│   │   ├── app/         # Next.js App Router pages
│   │   ├── components/  # Reusable React components
│   │   ├── contexts/    # React Context providers
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
│   └── public/          # Static assets
│
└── docker-compose.yml   # Docker orchestration
```

## 🏗 Architecture

See detailed architecture documentation in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Key Design Patterns

- **Per-User Data Isolation**: All data (history, settings) is stored per user
- **JWT Authentication**: Stateless authentication with JWT tokens
- **RESTful API**: Clean REST API design
- **Component-Based UI**: Reusable React components
- **Service Layer**: Business logic separated from routes
- **Middleware Pattern**: Auth and admin middleware for protected routes

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational purposes only. Please respect copyright laws and only download content you have the legal right to access. The developers are not responsible for any misuse of this software.

## 🙏 Acknowledgments

- [The Pirate Bay](https://thepiratebay.org) - Torrent search
- [OMDB API](https://www.omdbapi.com/) - Movie metadata
- [qBittorrent](https://www.qbittorrent.org/) - Torrent client
- [Jellyfin](https://jellyfin.org/) - Media server
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## 📞 Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/Tb3c123/piratebay-torrent-finder/issues)
- Documentation: [docs/](docs/)

---

Made with ❤️ by the Pirate Bay Torrent Finder Team
