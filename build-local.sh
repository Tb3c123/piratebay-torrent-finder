#!/bin/bash
# Build and test locally without Docker

set -e  # Exit on any error

echo "🧪 Running local build and tests..."
echo ""

# Check API endpoints first
echo "🔍 Checking API endpoints..."
./tests/check-api-endpoints.sh
echo "  ✓ API endpoints validated"
echo ""

# Backend tests and build
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

npm run build
echo "  ✓ Backend ready"

cd ..

# Frontend tests and build
echo ""
echo "🎨 Running frontend tests and build..."
cd frontend
npm install --quiet
echo "  ✓ Dependencies installed"

npm run type-check
echo "  ✓ TypeScript check passed"

echo "  ✓ Linting skipped (ESLint v9 migration pending)"

npm test -- --passWithNoTests --silent
echo "  ✓ Tests passed"

npm run build
echo "  ✓ Frontend build completed"

cd ..

echo ""
echo "✅ All tests and builds passed!"
echo ""
echo "📊 Build Summary:"
echo "  Backend: Ready to run (npm start in backend/)"
echo "  Frontend: Built (.next/ folder ready)"
echo ""
echo "🚀 To run locally:"
echo "  Terminal 1: cd backend && npm start"
echo "  Terminal 2: cd frontend && npm start"
echo ""
echo "Or use Docker Compose:"
echo "  docker-compose up"
