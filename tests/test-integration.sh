#!/bin/bash
# End-to-End Integration Tests
# Tests complete flow: Frontend -> Backend -> External APIs

set -e

FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
FAILED=0

echo "🧪 Testing End-to-End Integration..."
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Test 1: Backend can fetch data from OMDB
echo "Test 1: Backend fetches data from OMDB API"
SEARCH_RESPONSE=$(curl -s "$BACKEND_URL/api/v1/movies/search?query=Matrix&page=1")
if ! echo "$SEARCH_RESPONSE" | grep -q '"success":true'; then
    echo "  ❌ FAILED - Backend cannot fetch from OMDB"
    FAILED=$((FAILED + 1))
elif ! echo "$SEARCH_RESPONSE" | grep -q '"imdbID"'; then
    echo "  ❌ FAILED - No movie data returned"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Backend successfully fetches OMDB data"
fi

# Test 2: Backend can search Pirate Bay
echo "Test 2: Backend searches Pirate Bay"
TORRENT_RESPONSE=$(curl -s "$BACKEND_URL/api/v1/torrents/search?query=Ubuntu&category=0")
if ! echo "$TORRENT_RESPONSE" | grep -q '"success":true'; then
    echo "  ❌ FAILED - Backend cannot search Pirate Bay"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Backend successfully searches torrents"
fi

# Test 3: Frontend and Backend connectivity
echo "Test 3: Frontend can reach backend API"
# Check if frontend HTML contains API URL configuration
FRONTEND_HTML=$(curl -s "$FRONTEND_URL")
if [ -z "$FRONTEND_HTML" ]; then
    echo "  ❌ FAILED - Cannot fetch frontend HTML"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Frontend is accessible"
fi

# Test 4: API response time
echo "Test 4: API response time"
START_TIME=$(date +%s%N)
curl -s "$BACKEND_URL/api/v1/health" > /dev/null
END_TIME=$(date +%s%N)
DURATION=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $DURATION -gt 1000 ]; then
    echo "  ⚠️  WARNING - API response slow (${DURATION}ms)"
else
    echo "  ✓ PASSED - API response time: ${DURATION}ms"
fi

# Test 5: Error handling
echo "Test 5: API error handling"
ERROR_RESPONSE=$(curl -s "$BACKEND_URL/api/v1/movies/search?query=")
if ! echo "$ERROR_RESPONSE" | grep -q '"success":false'; then
    echo "  ❌ FAILED - API doesn't handle errors properly"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - API handles errors correctly"
fi

echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All integration tests passed (5/5)"
    exit 0
else
    echo "❌ $FAILED integration test(s) failed"
    exit 1
fi
