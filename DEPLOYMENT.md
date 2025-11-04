# Deployment Guide

## Quick Start với Docker Hub Images

### Prerequisites
- Docker & Docker Compose installed
- OMDB API key (free): http://www.omdbapi.com/apikey.aspx
- (Optional) qBittorrent Web UI running

### 1. Clone hoặc tải file cấu hình
```bash
# Clone repository
git clone https://github.com/Tb3c123/piratebay-torrent-finder.git
cd piratebay-torrent-finder

# Hoặc chỉ cần tải file docker-compose.deploy.yml
wget https://raw.githubusercontent.com/Tb3c123/piratebay-torrent-finder/main/docker-compose.deploy.yml
```

### 2. Tạo file `.env`
```bash
# Copy từ example
cp .env.example .env

# Hoặc tạo mới
cat > .env << 'EOF'
OMDB_API_KEY=your_omdb_api_key
QBITTORRENT_URL=http://192.168.1.100:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=adminpass
JWT_SECRET=your-random-64-character-secret-key-change-this
EOF
```

### 3. Deploy
```bash
# Pull images và start services
docker-compose -f docker-compose.deploy.yml up -d

# Xem logs
docker-compose -f docker-compose.deploy.yml logs -f

# Kiểm tra status
docker-compose -f docker-compose.deploy.yml ps
```

### 4. Truy cập ứng dụng
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health check:** http://localhost:3001/api/system/health

### 5. Dừng services
```bash
docker-compose -f docker-compose.deploy.yml down

# Xóa cả volumes (data)
docker-compose -f docker-compose.deploy.yml down -v
```

## Update Image Version

### Cách 1: Update lên latest version
```bash
# Pull images mới nhất
docker-compose -f docker-compose.deploy.yml pull

# Restart services
docker-compose -f docker-compose.deploy.yml up -d
```

### Cách 2: Dùng specific version (SHA)
Edit `docker-compose.deploy.yml`:
```yaml
services:
  piratebay-backend:
    image: tb3c123/piratebay-torrent-finder-backend:847218a  # specific SHA
  piratebay-frontend:
    image: tb3c123/piratebay-torrent-finder-frontend:847218a
```

Rồi restart:
```bash
docker-compose -f docker-compose.deploy.yml up -d
```

## Deployment trên VPS/Cloud

### Option 1: Docker Compose (Simple)
```bash
# SSH vào server
ssh user@your-server.com

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repo
git clone https://github.com/Tb3c123/piratebay-torrent-finder.git
cd piratebay-torrent-finder

# Setup environment
nano .env  # edit với API keys của bạn

# Deploy
docker-compose -f docker-compose.deploy.yml up -d
```

### Option 2: Với Nginx Reverse Proxy
Nếu bạn muốn expose qua domain (e.g., https://movies.yourdomain.com):

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name movies.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Sau đó cài SSL với Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d movies.yourdomain.com
```

### Option 3: Deploy lên Portainer
1. Truy cập Portainer UI
2. Stacks → Add stack
3. Paste nội dung `docker-compose.deploy.yml`
4. Thêm environment variables trong UI
5. Deploy

### Option 4: Deploy lên CasaOS
1. Mở CasaOS App Store
2. Tìm "Pirate Bay Torrent Finder" (nếu đã submit)
3. Hoặc import custom app với `docker-compose.deploy.yml`
4. Cấu hình environment variables
5. Install

## Scaling & Performance

### Scale backend cho load balancing
Edit `docker-compose.deploy.yml`:
```yaml
services:
  piratebay-backend:
    image: tb3c123/piratebay-torrent-finder-backend:latest
    deploy:
      replicas: 3  # Chạy 3 instances
    # ... rest of config
```

Deploy với swarm mode hoặc dùng load balancer (nginx upstream).

### Resource limits
```yaml
services:
  piratebay-backend:
    image: tb3c123/piratebay-torrent-finder-backend:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Troubleshooting

### Container không start
```bash
# Xem logs chi tiết
docker-compose -f docker-compose.deploy.yml logs backend
docker-compose -f docker-compose.deploy.yml logs frontend

# Kiểm tra container status
docker ps -a
```

### Frontend không kết nối được backend
- Kiểm tra `NEXT_PUBLIC_API_URL` trong frontend container
- Đảm bảo backend đang chạy: `curl http://localhost:3001/api/system/health`
- Kiểm tra network: `docker network inspect piratebay-torrent-finder_piratebay-network`

### Port conflict
Nếu port 3000/3001 đã bị dùng, edit ports trong `docker-compose.deploy.yml`:
```yaml
ports:
  - "8080:3000"  # Expose frontend trên port 8080
```

### Database/data mất sau khi restart
Đảm bảo volume mount đúng:
```yaml
volumes:
  - ./data:/app/data  # Data sẽ lưu trong ./data trên host
```

## Security Checklist

- [ ] Đổi `JWT_SECRET` thành random string dài
- [ ] Dùng strong passwords cho qBittorrent
- [ ] Setup firewall (chỉ mở port 80/443)
- [ ] Enable HTTPS với Let's Encrypt
- [ ] Regularly update images: `docker-compose pull && docker-compose up -d`
- [ ] Backup `./data` folder thường xuyên

## Backup & Restore

### Backup
```bash
# Backup data folder
tar -czf backup-$(date +%Y%m%d).tar.gz ./data

# Backup to remote (S3, Google Drive, etc.)
rclone copy ./data remote:backups/piratebay-torrent-finder
```

### Restore
```bash
# Extract backup
tar -xzf backup-20251104.tar.gz

# Restart services
docker-compose -f docker-compose.deploy.yml restart
```

## Monitoring

### Basic health check
```bash
# Check if services are running
curl http://localhost:3001/api/system/health
curl -I http://localhost:3000

# Watch logs
docker-compose -f docker-compose.deploy.yml logs -f --tail=50
```

### Advanced monitoring (optional)
Setup Prometheus + Grafana stack hoặc dùng Uptime Kuma.

## Available Images

- **Docker Hub:** 
  - Backend: `docker pull tb3c123/piratebay-torrent-finder-backend:latest`
  - Frontend: `docker pull tb3c123/piratebay-torrent-finder-frontend:latest`

- **Tags:**
  - `latest` - Latest stable build from main branch
  - `<SHA>` - Specific git commit (e.g., `847218a`)

## Support

- GitHub Issues: https://github.com/Tb3c123/piratebay-torrent-finder/issues
- Documentation: https://github.com/Tb3c123/piratebay-torrent-finder/tree/main/docs

## License

See [LICENSE](LICENSE) file in repository.
