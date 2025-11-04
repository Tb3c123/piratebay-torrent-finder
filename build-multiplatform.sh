#!/bin/bash
# Build multi-platform images for both ARM and AMD64

echo "🔨 Building backend for multiple platforms..."
docker buildx build --platform linux/amd64,linux/arm64 \
  -t tb3c123/piratebay-torrent-finder-backend:latest \
  -t tb3c123/piratebay-torrent-finder-backend:$(git rev-parse --short HEAD) \
  --push \
  ./backend

echo "🔨 Building frontend for multiple platforms..."
docker buildx build --platform linux/amd64,linux/arm64 \
  -t tb3c123/piratebay-torrent-finder-frontend:latest \
  -t tb3c123/piratebay-torrent-finder-frontend:$(git rev-parse --short HEAD) \
  --push \
  ./frontend

echo "✅ Multi-platform images built and pushed!"
