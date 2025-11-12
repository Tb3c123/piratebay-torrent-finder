#!/bin/bash
# Build script for Linux production server (no buildx needed)

set -e

echo "🔨 Getting git SHA..."
SHA=$(git rev-parse --short HEAD)
echo "Building images with tag: $SHA"

echo ""
echo "🔨 Building backend..."
docker build -t tb3c123/piratebay-torrent-finder-backend:latest \
             -t tb3c123/piratebay-torrent-finder-backend:$SHA \
             ./backend

echo ""
echo "🔨 Building frontend..."
docker build -t tb3c123/piratebay-torrent-finder-frontend:latest \
             -t tb3c123/piratebay-torrent-finder-frontend:$SHA \
             ./frontend

echo ""
echo "📤 Pushing backend images..."
docker push tb3c123/piratebay-torrent-finder-backend:latest
docker push tb3c123/piratebay-torrent-finder-backend:$SHA

echo ""
echo "📤 Pushing frontend images..."
docker push tb3c123/piratebay-torrent-finder-frontend:latest
docker push tb3c123/piratebay-torrent-finder-frontend:$SHA

echo ""
echo "✅ Build and push completed!"
echo "Images: backend:$SHA, frontend:$SHA"
