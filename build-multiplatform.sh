#!/bin/bash
# Build AMD64 (Linux server) images

# Load build environment variables
if [ -f .env.build ]; then
    export $(cat .env.build | grep -v '^#' | xargs)
fi

SHA=$(git rev-parse --short HEAD)

echo "🔨 Building backend for AMD64..."
docker buildx build --platform linux/amd64 \
  -t tb3c123/piratebay-torrent-finder-backend:latest \
  -t tb3c123/piratebay-torrent-finder-backend:$SHA \
  --push \
  ./backend

echo ""
echo "🔨 Building frontend for AMD64..."
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001} \
  -t tb3c123/piratebay-torrent-finder-frontend:latest \
  -t tb3c123/piratebay-torrent-finder-frontend:$SHA \
  --push \
  ./frontend

echo "✅ AMD64 images built and pushed!"
