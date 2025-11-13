# 🏴‍☠️ Pirate Bay Torrent Finder - Version 1.0

Production deployment guide using Docker images from Docker Hub.

## 📦 Docker Images

- **Backend**: `tb3c123/piratebay-backend:1.0` (161MB)
- **Frontend**: `tb3c123/piratebay-frontend:1.0` (180MB)

## 🚀 Quick Start

### 1. Pull images from Docker Hub

```bash
docker pull tb3c123/piratebay-backend:1.0
docker pull tb3c123/piratebay-frontend:1.0
```

### 2. Create environment file

Create `.env` file with your configuration:

```env
# Ports
BACKEND_PORT=3001
FRONTEND_PORT=3000

# API Configuration (Optional - only if needed)
NEXT_PUBLIC_API_URL=http://localhost:3001

# OMDB API (Optional - for movie metadata)
OMDB_API_KEY=your_omdb_api_key_here

# qBittorrent (Required for downloads)
QBITTORRENT_URL=http://your-qbittorrent-server:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=your_password

# Pirate Bay URL (Optional - default uses official site)
PIRATEBAY_URL=https://thepiratebay.org
```

### 3. Deploy using Docker Compose

```bash
# Using production docker-compose
docker-compose -f docker-compose.prod.yml up -d

# Or using the default docker-compose
docker-compose up -d
```

### 4. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📝 First Time Setup

1. Open http://localhost:3000
2. Click on the Account icon (top right)
3. Register the first user - **this user automatically becomes admin**
4. Login with your credentials
5. Go to Settings to configure:
   - qBittorrent connection
   - Jellyfin library (optional)

## 🔧 Manual Deployment (Without Docker Compose)

### Backend

```bash
docker run -d \
  --name piratebay-backend \
  -p 3001:3001 \
  -e PORT=3001 \
  -e QBITTORRENT_URL=http://your-server:8080 \
  -e QBITTORRENT_USERNAME=admin \
  -e QBITTORRENT_PASSWORD=yourpass \
  -v ./backend/data:/app/src/data \
  --restart unless-stopped \
  tb3c123/piratebay-backend:1.0
```

### Frontend

```bash
docker run -d \
  --name piratebay-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3001 \
  --restart unless-stopped \
  tb3c123/piratebay-frontend:1.0
```

## 🌐 Production Deployment

For production deployment with a custom domain:

```bash
# Set environment variables
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
export QBITTORRENT_URL=https://qbittorrent.yourdomain.com

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Nginx Reverse Proxy Example

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Data Persistence

Application data is stored in `./backend/data/`:
- `settings.json` - User settings (qBittorrent, Jellyfin)
- `search-history.json` - Search history
- `logs.json` - Application logs

**Make sure to backup this directory regularly!**

## 🔄 Updating to Latest Version

```bash
# Pull latest images
docker pull tb3c123/piratebay-backend:latest
docker pull tb3c123/piratebay-frontend:latest

# Restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

## 🛑 Stopping the Application

```bash
docker-compose -f docker-compose.prod.yml down
```

## 🐛 Troubleshooting

### Backend not connecting to qBittorrent

Check logs:
```bash
docker logs piratebay-backend
```

Verify qBittorrent settings in the app Settings page.

### Frontend can't reach backend

Ensure `NEXT_PUBLIC_API_URL` is set correctly:
- Local: `http://localhost:3001`
- Production: `https://api.yourdomain.com`

### Port already in use

Change ports in `.env` file:
```env
BACKEND_PORT=3002
FRONTEND_PORT=3001
```

## 📖 Features

- ✅ Movie/Anime search with OMDB metadata
- ✅ Direct Pirate Bay torrent search
- ✅ qBittorrent integration for downloads
- ✅ Jellyfin library integration
- ✅ User authentication with admin panel
- ✅ Search history with category tags (piratebay/movie)
- ✅ Settings locked for authenticated users only
- ✅ Dark theme responsive UI
- ✅ Download counter in header
- ✅ Auto-refresh torrent status

## 📜 Version History

### v1.0 (2025-11-13)
- Initial production release
- Full feature set implemented
- Docker images published to Docker Hub

## 🔗 Links

- **GitHub**: https://github.com/Tb3c123/piratebay-torrent-finder
- **Docker Hub**: 
  - https://hub.docker.com/r/tb3c123/piratebay-backend
  - https://hub.docker.com/r/tb3c123/piratebay-frontend

## 📄 License

MIT License - See LICENSE file for details
