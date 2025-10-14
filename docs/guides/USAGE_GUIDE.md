# 🏴‍☠️ Pirate Bay Torrent Finder - Complete Guide

A modern, Docker-based web application similar to Jellyseerr for searching movies/TV shows on The Pirate Bay and OMDB, with qBittorrent integration for seamless downloads.

## ✨ New Features (Movie Browser)

### 🎬 **Movie Discovery & Download**

1. **Browse Movies**: Click "🎬 Browse Movies" on home page
2. **Search Movies**: Search by title (e.g., "Inception", "Avengers")
3. **View Details**: Click any movie to see full details with poster
4. **Auto Torrent Search**: Torrents automatically searched when viewing movie
5. **One-Click Download**: Download torrents directly from movie page

### Movie Details Include

- Movie poster and title
- IMDB rating, Metascore, Rotten Tomatoes scores
- Full plot, cast, director information
- Genre tags, release date, runtime
- Awards and nominations
- Available torrents with seeders/leechers

## 🚀 Quick Start Guide

### Method 1: Development Mode (For Testing)

```bash
# 1. Get OMDB API Key (FREE)
# Visit: http://www.omdbapi.com/apikey.aspx
# Click activation link in email

# 2. Start Backend
cd backend
npm install
# Edit .env and add OMDB_API_KEY=your_key_here
npm run dev

# 3. Start Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:3000 (or 3002 if 3000 is busy)
```

### Method 2: Docker (Production)

```bash
# 1. Edit backend/.env and add OMDB_API_KEY
# 2. Build and run
docker-compose up -d

# 3. Access at http://localhost:3000
```

## 📖 How to Use

### Option A: Browse Movies (Recommended for finding content)

1. **Home Page** → Click "🎬 Browse Movies"
2. **Search**: Type movie name (e.g., "Batman", "Inception")
3. **Browse**: Scroll through movies with posters
4. **Select**: Click any movie card
5. **Auto-Search**: Torrents load automatically
6. **Download**: Click "⬇️ Download" button

### Option B: Direct Torrent Search (Classic mode)

1. **Home Page** → Enter search query
2. **Results**: Browse torrent list
3. **Download**: Click download button
4. **History**: View past searches below search bar

## 🔧 Configuration

### Backend Environment (.env)

```env
PORT=3001

# OMDB API Key - GET FROM: http://www.omdbapi.com/apikey.aspx
OMDB_API_KEY=your_key_here

# qBittorrent Settings
QBITTORRENT_URL=http://localhost:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminadmin

# Optional
PIRATEBAY_URL=https://thepiratebay.org
NODE_ENV=development
```

### Frontend Environment (.env)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🎯 Features Overview

### 🎬 Movie Browser

- Search movies from OMDB database
- Display movie posters and info
- Pagination support
- Responsive grid layout

### 🎥 Movie Details Page

- Full movie information
- IMDB ratings and scores
- Plot, cast, director
- **Auto torrent search**
- One-click downloads

### 🔍 Torrent Search

- The Pirate Bay API integration
- Search by name, filter by category
- Sorted by seeders (best first)
- Magnet links ready

### 📥 qBittorrent Integration

- Add torrents with one click
- Background downloads
- Queue management

### 📊 System Features

- **Search History**: Last 30 days, shared across devices
- **System Logs**: Real-time with filtering
- **Auto-Cleanup**: Every 30 days (production only)
- **Manual Cleanup**: Via logs page
- **Restart Controls**: Backend/frontend restart buttons

## 🌐 API Endpoints

### Movies

```
GET  /api/movies/search?query=Inception&page=1
GET  /api/movies/:imdbId
GET  /api/movies/trending/popular
```

### Torrents

```
GET  /api/search?query=movie+name&category=0
```

### Downloads

```
POST /api/qbittorrent/add
GET  /api/qbittorrent/status
```

### History & Logs

```
GET    /api/history
POST   /api/history
DELETE /api/history
GET    /api/history/stats
POST   /api/history/cleanup
GET    /api/logs
```

## 📱 User Interface

### Navigation

- **Home** (🏴‍☠️): Direct torrent search
- **Movies** (🎬): Browse movie database
- **Logs** (📊): System logs and controls

### Pages

1. **Home** (`/`): Torrent search + history
2. **Movies** (`/movies`): Movie browser with search
3. **Movie Detail** (`/movie/:imdbId`): Info + auto torrent search
4. **Logs** (`/logs`): System logs + controls

## 🔥 Tips & Tricks

### Finding Movies Fast

1. Use Movie Browser for discovering content
2. Movie details page auto-searches torrents
3. Check seeders count (green number) - higher is better
4. File size shown for each torrent

### Best Quality Downloads

- Look for torrents with format in name: "1080p", "BluRay", "WEB-DL"
- Check seeders: >10 = good, >100 = excellent
- Larger files usually = better quality

### Managing History

- History saved for 30 days
- Shared across all browsers
- Manual cleanup in Logs page
- Auto-cleanup in production mode

## 🐛 Troubleshooting

### Problem: Movies not loading (401 error)

**Solution**:

1. Check OMDB API key in `backend/.env`
2. Verify key is activated (click email link)
3. Restart backend: `touch backend/src/index.js`

### Problem: Torrents not downloading

**Solution**:

1. Check qBittorrent is running: `http://localhost:8080`
2. Verify credentials in `.env`
3. Test qBittorrent Web UI manually

### Problem: Frontend on wrong port

**Solution**:

- Frontend auto-finds available port (3000, 3001, 3002, etc.)
- Check terminal output for actual port
- Or specify: `PORT=3000 npm run dev`

### Problem: No movie posters showing

**Solution**:

1. Check `frontend/next.config.js` has image config
2. Clear browser cache
3. Restart frontend

### Problem: Backend keeps restarting

**Solution**:

- Check for infinite loops in logs
- Verify `.env` format (no extra spaces)
- Auto-cleanup is DISABLED in development

## 📁 Project Structure

```
/Users/tb3c/Documents/Jellyseer Clone/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── movies.js       # OMDB movie API
│   │   │   ├── search.js       # TPB torrent search
│   │   │   ├── qbittorrent.js  # Download management
│   │   │   ├── history.js      # Search history
│   │   │   ├── logs.js         # System logs
│   │   │   └── system.js       # Controls
│   │   ├── services/
│   │   │   ├── omdb.js         # OMDB integration
│   │   │   ├── piratebay.js    # TPB API integration
│   │   │   └── qbittorrent.js  # qBit client
│   │   └── index.js            # Express server
│   ├── data/
│   │   └── search-history.json # Persistent storage
│   └── .env                    # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home - torrent search
│   │   │   ├── movies/
│   │   │   │   └── page.tsx    # Movie browser
│   │   │   ├── movie/[imdbId]/
│   │   │   │   └── page.tsx    # Movie details + torrents
│   │   │   └── logs/
│   │   │       └── page.tsx    # System logs
│   │   └── components/
│   │       ├── MovieCard.tsx   # Movie grid item
│   │       ├── SearchBar.tsx
│   │       ├── TorrentResults.tsx
│   │       └── SearchHistory.tsx
│   └── next.config.js          # Image config
│
├── docker-compose.yml          # Docker setup
└── README.md                   # This file
```

## 🎓 Development Notes

### Auto-Cleanup Behavior

- **Development** (`NODE_ENV!=production`): DISABLED
- **Production**: Runs every 30 days
- **Manual**: Always available in Logs page

### OMDB API Usage

- Free tier: 1,000 requests/day
- Caches on frontend
- Search returns 10 results per page

### Search History

- Stored in `backend/data/search-history.json`
- Max 100 entries
- 30-day retention
- Shared across browsers

## 🔮 Future Enhancements

- [ ] TV show support with seasons
- [ ] User favorites and watchlist
- [ ] Quality filters (1080p, 4K, etc.)
- [ ] Subtitle search integration
- [ ] Plex/Jellyfin integration
- [ ] Mobile app
- [ ] Notification system
- [ ] Multi-language support

## ⚠️ Legal Disclaimer

This tool is for **educational purposes only**. Users are responsible for ensuring they have the legal right to download and share any content. Always respect copyright laws in your jurisdiction.

## 📧 Support

For issues, questions, or feature requests:

1. Check Troubleshooting section above
2. Review logs at `/logs` page
3. Open an issue on GitHub

---

**Made with ❤️ for the home media server community**

**Status**: ✅ Fully functional - Movie browser, torrent search, and qBittorrent integration working!
