#!/bin/bash
# Post-Build Docker Tests
# Runs all integration tests on Docker containers after build

set -e

echo "🐳 Post-Build Docker Integration Tests"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make test scripts executable
chmod +x "$SCRIPT_DIR/test-backend.sh"
chmod +x "$SCRIPT_DIR/test-frontend.sh"
chmod +x "$SCRIPT_DIR/test-integration.sh"

# Test configuration
BACKEND_PORT=3001
FRONTEND_PORT=3000
BACKEND_URL="http://localhost:$BACKEND_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT"

# Docker configuration
NETWORK_NAME="test-network"
BACKEND_CONTAINER="test-backend"
FRONTEND_CONTAINER="test-frontend"
BACKEND_IMAGE=${BACKEND_IMAGE:-tb3c123/piratebay-torrent-finder-backend:latest}
FRONTEND_IMAGE=${FRONTEND_IMAGE:-tb3c123/piratebay-torrent-finder-frontend:latest}

# Cleanup function
cleanup() {
    echo ""
    echo "🧹 Cleaning up test containers..."
    docker rm -f $BACKEND_CONTAINER $FRONTEND_CONTAINER 2>/dev/null || true
    docker network rm $NETWORK_NAME 2>/dev/null || true
    echo "  ✓ Cleanup completed"
}

# Set trap to cleanup on exit
trap cleanup EXIT

echo "📦 Starting test environment..."
echo ""

# Create network
echo "Creating test network..."
docker network create $NETWORK_NAME 2>/dev/null || true
echo "  ✓ Network created: $NETWORK_NAME"

# Start backend
echo ""
echo "🚀 Starting backend container..."
docker run -d \
  --name $BACKEND_CONTAINER \
  --network $NETWORK_NAME \
  -p $BACKEND_PORT:3001 \
  -e OMDB_API_KEY=3d5cd52a \
  -e PIRATEBAY_URL=https://apibay.org \
  $BACKEND_IMAGE

echo "  ✓ Backend container started"
echo "  ⏳ Waiting for backend to be ready..."
sleep 5

# Check if backend is running
if ! docker ps | grep -q $BACKEND_CONTAINER; then
    echo -e "${RED}  ❌ Backend container failed to start${NC}"
    docker logs $BACKEND_CONTAINER
    exit 1
fi
echo "  ✓ Backend is running"

# Start frontend
echo ""
echo "🚀 Starting frontend container..."
docker run -d \
  --name $FRONTEND_CONTAINER \
  --network $NETWORK_NAME \
  -p $FRONTEND_PORT:3000 \
  -e NEXT_PUBLIC_API_URL=$BACKEND_URL \
  $FRONTEND_IMAGE

echo "  ✓ Frontend container started"
echo "  ⏳ Waiting for frontend to be ready..."
sleep 8

# Check if frontend is running
if ! docker ps | grep -q $FRONTEND_CONTAINER; then
    echo -e "${RED}  ❌ Frontend container failed to start${NC}"
    docker logs $FRONTEND_CONTAINER
    exit 1
fi
echo "  ✓ Frontend is running"

echo ""
echo "========================================"
echo "🧪 Running Integration Tests"
echo "========================================"
echo ""

# Run backend tests
echo -e "${YELLOW}Backend Tests:${NC}"
echo "----------------------------------------"
BACKEND_URL=$BACKEND_URL "$SCRIPT_DIR/test-backend.sh"
BACKEND_STATUS=$?

echo ""

# Run frontend tests
echo -e "${YELLOW}Frontend Tests:${NC}"
echo "----------------------------------------"
FRONTEND_URL=$FRONTEND_URL BACKEND_URL=$BACKEND_URL "$SCRIPT_DIR/test-frontend.sh"
FRONTEND_STATUS=$?

echo ""

# Run integration tests
echo -e "${YELLOW}Integration Tests:${NC}"
echo "----------------------------------------"
FRONTEND_URL=$FRONTEND_URL BACKEND_URL=$BACKEND_URL "$SCRIPT_DIR/test-integration.sh"
INTEGRATION_STATUS=$?

echo ""
echo "========================================"
echo "📊 Test Summary"
echo "========================================"

# Calculate results
TOTAL_TESTS=3
PASSED_TESTS=0

if [ $BACKEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend Tests: PASSED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} Backend Tests: FAILED"
fi

if [ $FRONTEND_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend Tests: PASSED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} Frontend Tests: FAILED"
fi

if [ $INTEGRATION_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Integration Tests: PASSED"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗${NC} Integration Tests: FAILED"
fi

echo ""
echo "Results: $PASSED_TESTS/$TOTAL_TESTS test suites passed"
echo ""

# Container logs if tests failed
if [ $PASSED_TESTS -ne $TOTAL_TESTS ]; then
    echo "========================================"
    echo "📋 Container Logs"
    echo "========================================"
    echo ""
    echo "Backend Logs:"
    echo "----------------------------------------"
    docker logs $BACKEND_CONTAINER --tail 50
    echo ""
    echo "Frontend Logs:"
    echo "----------------------------------------"
    docker logs $FRONTEND_CONTAINER --tail 50
fi

# Exit with appropriate code
if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}✅ All post-build tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some post-build tests failed${NC}"
    exit 1
fi
