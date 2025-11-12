# Deployment Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [CI/CD Pipeline](#cicd-pipeline)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This guide covers deploying the Pirate Bay Torrent Finder application using:

- **Docker** for containerization
- **GitHub Actions** for automated CI/CD
- **Docker Hub** for image registry
- **Multi-platform builds** (AMD64 + ARM64)

### Deployment Architectures

**Development:**
```
Developer → Git Push → Local Docker Compose → http://localhost:3000
```

**Production:**
```
Git Tag → GitHub Actions → Docker Hub → Production Server → https://yourdomain.com
```

## 📦 Prerequisites

### For Automated Deployment (GitHub Actions)

1. **GitHub Repository Secrets**
   - `DOCKER_USERNAME` - Docker Hub username
   - `DOCKER_PASSWORD` - Docker Hub access token
   - `NEXT_PUBLIC_API_URL` - (Optional) Production API URL

2. **Docker Hub Account**
   - Create account at https://hub.docker.com
   - Create access token (Account Settings → Security)

### For Manual Deployment

1. **Docker Environment**
   ```bash
   docker --version  # Docker 24.0+
   docker-compose --version  # v2.20+
   ```

2. **Build Tools** (for local builds)
   ```bash
   node --version  # Node.js 20+
   npm --version   # npm 10+
   git --version   # Git 2.40+
   ```

## 🤖 CI/CD Pipeline

### Automated Workflow

The GitHub Actions workflow automatically:

1. ✅ **Tests** - Run all unit & integration tests
2. 🔍 **Linting** - Check code quality
3. 🏗️ **Build** - Create multi-platform Docker images
4. 📤 **Push** - Upload to Docker Hub
5. 🏷️ **Tag** - Version with git SHA and semantic version
6. 📝 **Release** - Create GitHub release (for version tags)

### Triggering Deployment

**Option 1: Push to main (latest)**
```bash
git add .
git commit -m "feat: your feature"
git push origin main
```

**Option 2: Create version tag (release)**
```bash
# Create and push tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Workflow Jobs

```yaml
backend-tests → frontend-tests → docker-build-push → create-release
                                         ↓
                                   Docker Hub Images
```

**Images created:**
- `tb3c123/piratebay-torrent-finder-backend:latest`
- `tb3c123/piratebay-torrent-finder-backend:<sha>`
- `tb3c123/piratebay-torrent-finder-backend:<version>` (for tags)
- `tb3c123/piratebay-torrent-finder-frontend:latest`
- `tb3c123/piratebay-torrent-finder-frontend:<sha>`
- `tb3c123/piratebay-torrent-finder-frontend:<version>` (for tags)

### Monitoring Builds

1. Go to repository → **Actions** tab
2. Select workflow run
3. View logs for each job
4. Check deployment summary

## 🛠️ Manual Deployment

### Method 1: Using Build Scripts

**For macOS/Linux Development (multi-platform):**
```bash
# Load environment variables
cp .env.build.example .env.build
nano .env.build  # Configure NEXT_PUBLIC_API_URL

# Build and push multi-platform images
./build-multiplatform.sh
```

**For Linux Production Server (AMD64 only):**
```bash
# Build and push AMD64 images
./build-linux.sh
```

### Method 2: Manual Docker Build

**Build backend:**
```bash
SHA=$(git rev-parse --short HEAD)

# AMD64 only
docker build -t tb3c123/piratebay-torrent-finder-backend:latest \
             -t tb3c123/piratebay-torrent-finder-backend:$SHA \
             ./backend

# Multi-platform
docker buildx build --platform linux/amd64,linux/arm64 \
  -t tb3c123/piratebay-torrent-finder-backend:latest \
  -t tb3c123/piratebay-torrent-finder-backend:$SHA \
  --push \
  ./backend
```

**Build frontend:**
```bash
# AMD64 only
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://your-api-url:3001 \
  -t tb3c123/piratebay-torrent-finder-frontend:latest \
  -t tb3c123/piratebay-torrent-finder-frontend:$SHA \
  ./frontend

# Multi-platform
docker buildx build --platform linux/amd64,linux/arm64 \
  --build-arg NEXT_PUBLIC_API_URL=http://your-api-url:3001 \
  -t tb3c123/piratebay-torrent-finder-frontend:latest \
  -t tb3c123/piratebay-torrent-finder-frontend:$SHA \
  --push \
  ./frontend
```

**Push images:**
```bash
docker push tb3c123/piratebay-torrent-finder-backend:latest
docker push tb3c123/piratebay-torrent-finder-backend:$SHA
docker push tb3c123/piratebay-torrent-finder-frontend:latest
docker push tb3c123/piratebay-torrent-finder-frontend:$SHA
```

### Method 3: Docker Compose

**Development:**
```bash
docker-compose up -d --build
```

**Production:**
```bash
docker-compose -f docker-compose.deploy.yml up -d --build
```

## ⚙️ Environment Configuration

### Production Server Setup

1. **Create environment file**
   ```bash
   nano .env
   ```

2. **Configure variables**
   ```env
   # Backend
   PORT=3001
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   
   # API Keys
   OMDB_API_KEY=your_omdb_api_key_here
   
   # External Services
   QBITTORRENT_URL=http://your-server:8080
   QBITTORRENT_USERNAME=admin
   QBITTORRENT_PASSWORD=your_password
   
   JELLYFIN_URL=http://your-server:8096
   JELLYFIN_API_KEY=your_jellyfin_api_key
   
   # Frontend
   NEXT_PUBLIC_API_URL=http://your-server:3001
   ```

3. **Deploy**
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.deploy.yml pull
   
   # Start services
   docker-compose -f docker-compose.deploy.yml up -d
   
   # View logs
   docker-compose -f docker-compose.deploy.yml logs -f
   ```

### Using Specific Version

```bash
# Edit docker-compose.deploy.yml
nano docker-compose.deploy.yml

# Change image tags
services:
  backend:
    image: tb3c123/piratebay-torrent-finder-backend:v1.0.0  # ← Change this
  frontend:
    image: tb3c123/piratebay-torrent-finder-frontend:v1.0.0  # ← Change this
```

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3001 | Backend server port |
| `NODE_ENV` | No | development | Environment mode |
| `JWT_SECRET` | Yes | - | JWT signing key (min 32 chars) |
| `OMDB_API_KEY` | Yes | - | OMDB API key for movie data |
| `QBITTORRENT_URL` | Yes | - | qBittorrent Web UI URL |
| `QBITTORRENT_USERNAME` | Yes | - | qBittorrent username |
| `QBITTORRENT_PASSWORD` | Yes | - | qBittorrent password |
| `JELLYFIN_URL` | No | - | Jellyfin server URL |
| `JELLYFIN_API_KEY` | No | - | Jellyfin API key |
| `NEXT_PUBLIC_API_URL` | Yes | http://localhost:3001 | Frontend API endpoint |

## 📊 Monitoring & Maintenance

### Health Checks

**Check service status:**
```bash
docker-compose -f docker-compose.deploy.yml ps
```

**Check logs:**
```bash
# All services
docker-compose -f docker-compose.deploy.yml logs -f

# Specific service
docker-compose -f docker-compose.deploy.yml logs -f backend
docker-compose -f docker-compose.deploy.yml logs -f frontend
```

**Health endpoint:**
```bash
curl http://localhost:3001/api/health
```

### Updating Deployment

**Pull latest images:**
```bash
docker-compose -f docker-compose.deploy.yml pull
```

**Restart services:**
```bash
docker-compose -f docker-compose.deploy.yml up -d
```

**Rollback to previous version:**
```bash
# Edit docker-compose.deploy.yml to use previous tag
nano docker-compose.deploy.yml

# Pull and restart
docker-compose -f docker-compose.deploy.yml pull
docker-compose -f docker-compose.deploy.yml up -d
```

### Backup & Restore

**Backup data:**
```bash
# Backup database and JSON files
tar -czf backup-$(date +%Y%m%d).tar.gz backend/data/

# Backup to remote server
scp backup-*.tar.gz user@remote-server:/backups/
```

**Restore data:**
```bash
# Stop services
docker-compose -f docker-compose.deploy.yml down

# Extract backup
tar -xzf backup-YYYYMMDD.tar.gz

# Start services
docker-compose -f docker-compose.deploy.yml up -d
```

### Database Maintenance

**Backup database:**
```bash
# SQLite backup
sqlite3 backend/data/users.db ".backup 'backup.db'"
```

**Vacuum database:**
```bash
sqlite3 backend/data/users.db "VACUUM;"
```

## 🔧 Troubleshooting

### Build Issues

**Problem: Docker build fails**
```bash
# Clear build cache
docker builder prune -af

# Rebuild without cache
docker-compose build --no-cache
```

**Problem: Multi-platform build not working**
```bash
# Create buildx builder
docker buildx create --name multiplatform --use

# Verify platforms
docker buildx inspect --bootstrap
```

### Runtime Issues

**Problem: Backend can't connect to qBittorrent**
```bash
# Check qBittorrent is running
curl http://your-qbittorrent:8080

# Test connection from container
docker exec -it piratebay-backend sh
wget -O- http://your-qbittorrent:8080
```

**Problem: Frontend can't reach backend**
```bash
# Check backend is running
docker ps | grep backend

# Check backend logs
docker logs piratebay-backend

# Test backend API
curl http://localhost:3001/api/health
```

**Problem: Database locked**
```bash
# Stop all services
docker-compose down

# Remove lock file
rm backend/data/*.db-shm
rm backend/data/*.db-wal

# Restart
docker-compose up -d
```

### Permission Issues

**Problem: Volume permission denied**
```bash
# Fix ownership (Linux)
sudo chown -R 1001:1001 backend/data

# Or run with user flag
docker-compose run --user $(id -u):$(id -g) backend
```

## 🚀 Production Best Practices

### Security

1. **Use strong JWT secret**
   ```bash
   # Generate secure random key
   openssl rand -base64 32
   ```

2. **Enable HTTPS**
   - Use Nginx reverse proxy with SSL
   - Get free SSL from Let's Encrypt
   - See `docs/architecture/security.md`

3. **Restrict ports**
   - Only expose necessary ports (80, 443)
   - Keep backend/database ports internal

### Performance

1. **Resource limits**
   - Set CPU/memory limits in docker-compose
   - Monitor resource usage

2. **Caching**
   - Enable Docker build cache
   - Use Redis for application cache (future)

3. **Scaling**
   ```bash
   # Scale backend
   docker-compose -f docker-compose.deploy.yml up -d --scale backend=3
   ```

### Monitoring

1. **Log aggregation**
   - Forward logs to centralized system
   - Use ELK stack or similar

2. **Metrics**
   - Add Prometheus metrics (future)
   - Monitor with Grafana

3. **Alerts**
   - Set up uptime monitoring
   - Configure error notifications

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Security Guide](../docs/architecture/security.md)
- [Configuration Guide](../docs/structure/configuration.md)

## 📞 Support

For deployment issues:
- Check [Troubleshooting](#troubleshooting) section
- Review GitHub Actions logs
- Check Docker logs
- Create GitHub issue

---

**Last Updated:** Phase 6 - CI/CD & Deployment Setup
