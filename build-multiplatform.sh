#!/bin/bash
# Build AMD64 (Linux server) images with pre-build tests

set -e  # Exit on any error

# Load build environment variables
if [ -f .env.build ]; then
    export $(cat .env.build | grep -v '^#' | xargs)
fi

SHA=$(git rev-parse --short HEAD)

echo "🧪 Running tests before build..."
echo ""

# Backend tests
echo "📦 Running backend tests..."
cd backend
npm ci --quiet
echo "  ✓ Dependencies installed"

npm run test:pre-build
echo "  ✓ Pre-build tests passed"

npm run test:unit
echo "  ✓ Unit tests passed"

npm run test:integration
echo "  ✓ Integration tests passed"

cd ..

# Frontend tests
echo ""
echo "🎨 Running frontend tests..."
cd frontend
npm ci --quiet
echo "  ✓ Dependencies installed"

npm run type-check
echo "  ✓ TypeScript check passed"

npm run lint
echo "  ✓ Linting passed"

npm test -- --passWithNoTests --silent
echo "  ✓ Tests passed"

npm run build
echo "  ✓ Build test passed"

cd ..

echo ""
echo "✅ All tests passed! Proceeding with Docker builds..."
echo ""

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

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📊 Build Summary:"
echo "  Git SHA: $SHA"
echo "  Backend Image: tb3c123/piratebay-torrent-finder-backend:$SHA"
echo "  Frontend Image: tb3c123/piratebay-torrent-finder-frontend:$SHA"
echo ""
echo "🚀 Images pushed to Docker Hub!"
echo ""
echo "To deploy:"
echo "  docker pull tb3c123/piratebay-torrent-finder-backend:$SHA"
echo "  docker pull tb3c123/piratebay-torrent-finder-frontend:$SHA"

