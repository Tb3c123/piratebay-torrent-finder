# Hướng Dẫn Cài Đặt Nhanh

## Bước 1: Cài Backend

### Tạo network và folder

```bash
docker network create piratebay-network
mkdir -p ./backend/data
```

### Chạy Backend

```bash
docker run -d \
  --name piratebay-backend \
  --network piratebay-network \
  -p 3001:3001 \
  -e PORT=3001 \
  -e OMDB_API_KEY=your_omdb_key_here \
  -e JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long \
  -e QBITTORRENT_URL=http://192.168.1.100:8080 \
  -e QBITTORRENT_USERNAME=admin \
  -e QBITTORRENT_PASSWORD=your_password \
  -v $(pwd)/backend/data:/app/data \
  --restart unless-stopped \
  tb3c123/piratebay-torrent-finder-backend:latest
```

### Kiểm tra Backend

```bash
# Xem logs
docker logs -f piratebay-backend

# Health check
curl http://localhost:3001/api/system/health
```

## Bước 2: Cài Frontend

### Chạy Frontend

**Nếu frontend và backend cùng server (Docker network):**

```bash
docker run -d \
  --name piratebay-frontend \
  --network piratebay-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://piratebay-backend:3001 \
  --restart unless-stopped \
  tb3c123/piratebay-torrent-finder-frontend:latest
```

**Nếu expose qua Cloudflare Tunnel (frontend public, backend private):**

```bash
# Frontend sẽ gọi API qua internal Docker network
docker run -d \
  --name piratebay-frontend \
  --network piratebay-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://piratebay-backend:3001 \
  --restart unless-stopped \
  tb3c123/piratebay-torrent-finder-frontend:latest
```

### Kiểm tra Frontend

```bash
# Xem logs
docker logs -f piratebay-frontend

# Test
curl -I http://localhost:3000
```

## Truy cập

- **Frontend**: <http://localhost:3000>
- **Backend API**: <http://localhost:3001>

## Lệnh Quản Lý

### Xem logs

```bash
docker logs -f piratebay-backend
docker logs -f piratebay-frontend
```

### Restart

```bash
docker restart piratebay-backend
docker restart piratebay-frontend
```

### Stop

```bash
docker stop piratebay-backend piratebay-frontend
```

### Remove

```bash
docker stop piratebay-backend piratebay-frontend
docker rm piratebay-backend piratebay-frontend
```

### Update images

```bash
# Pull image mới
docker pull tb3c123/piratebay-torrent-finder-backend:latest
docker pull tb3c123/piratebay-torrent-finder-frontend:latest

# Stop container cũ
docker stop piratebay-backend piratebay-frontend
docker rm piratebay-backend piratebay-frontend

# Chạy lại từ Bước 1
```
