# Quick Deploy Scripts

## Chạy Backend và Frontend riêng biệt

### Cách 1: Deploy cả 2 services

```bash
# 1. Start backend trước
docker-compose -f docker-compose.backend.yml up -d

# 2. Đợi backend start (2-3 giây)
sleep 3

# 3. Start frontend
docker-compose -f docker-compose.frontend.yml up -d

# 4. Kiểm tra
docker ps
curl http://localhost:3001/api/system/health
curl -I http://localhost:3000
```

### Cách 2: Deploy chỉ Backend

```bash
# Start backend
docker-compose -f docker-compose.backend.yml up -d

# Xem logs
docker-compose -f docker-compose.backend.yml logs -f

# Stop
docker-compose -f docker-compose.backend.yml down
```

### Cách 3: Deploy chỉ Frontend

```bash
# Đảm bảo backend đã chạy (localhost:3001 hoặc remote)
docker-compose -f docker-compose.frontend.yml up -d

# Xem logs
docker-compose -f docker-compose.frontend.yml logs -f

# Stop
docker-compose -f docker-compose.frontend.yml down
```

## Environment Variables

Tạo file `.env`:

```bash
# Backend
OMDB_API_KEY=your_key_here
JWT_SECRET=your-64-character-secret-here
QBITTORRENT_URL=http://192.168.1.100:8080
QBITTORRENT_USERNAME=admin
QBITTORRENT_PASSWORD=password

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Update Images

```bash
# Update backend
docker-compose -f docker-compose.backend.yml pull
docker-compose -f docker-compose.backend.yml up -d

# Update frontend
docker-compose -f docker-compose.frontend.yml pull
docker-compose -f docker-compose.frontend.yml up -d

# Update cả 2
docker-compose -f docker-compose.backend.yml pull
docker-compose -f docker-compose.frontend.yml pull
docker-compose -f docker-compose.backend.yml up -d
docker-compose -f docker-compose.frontend.yml up -d
```

## Deploy trên 2 servers khác nhau

### Server 1: Backend only
```bash
# Backend server (e.g., 192.168.1.100)
docker-compose -f docker-compose.backend.yml up -d
```

### Server 2: Frontend only
```bash
# Frontend server (e.g., 192.168.1.101)
# Edit .env hoặc environment variable
export NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
docker-compose -f docker-compose.frontend.yml up -d
```

## One-liner Script

```bash
# Deploy all
cat > deploy-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting backend..."
docker-compose -f docker-compose.backend.yml up -d
sleep 3
echo "🎨 Starting frontend..."
docker-compose -f docker-compose.frontend.yml up -d
echo "✅ Done! Frontend: http://localhost:3000 | Backend: http://localhost:3001"
EOF
chmod +x deploy-all.sh
./deploy-all.sh

# Stop all
cat > stop-all.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping services..."
docker-compose -f docker-compose.frontend.yml down
docker-compose -f docker-compose.backend.yml down
echo "✅ All services stopped"
EOF
chmod +x stop-all.sh
# ./stop-all.sh để chạy
```

## Useful Commands

```bash
# Xem logs backend
docker-compose -f docker-compose.backend.yml logs -f

# Xem logs frontend
docker-compose -f docker-compose.frontend.yml logs -f

# Restart backend
docker-compose -f docker-compose.backend.yml restart

# Restart frontend
docker-compose -f docker-compose.frontend.yml restart

# Remove all
docker-compose -f docker-compose.frontend.yml down
docker-compose -f docker-compose.backend.yml down -v  # -v xóa cả volumes
```

## Deploy với specific version

Edit file docker-compose để dùng SHA tag:

```yaml
# docker-compose.backend.yml
services:
  backend:
    image: tb3c123/piratebay-torrent-finder-backend:847218a  # specific commit
```

Hoặc dùng environment variable:

```bash
IMAGE_TAG=847218a docker-compose -f docker-compose.backend.yml up -d
```
