#!/bin/bash
# Backend Integration Tests
# Tests backend API endpoints and data fetching

set -e

BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
FAILED=0

echo "🧪 Testing Backend API..."
echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Health endpoint
echo "Test 1: Health endpoint"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/system/health")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
    echo "  ❌ FAILED - Expected HTTP 200, got $HTTP_CODE"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Health endpoint returns 200"
fi

# Test 2: Cache stats endpoint
echo "Test 2: Cache stats endpoint"
CACHE_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/system/cache/stats")
HTTP_CODE=$(echo "$CACHE_RESPONSE" | tail -1)
BODY=$(echo "$CACHE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
    echo "  ❌ FAILED - Expected HTTP 200, got $HTTP_CODE"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Cache stats endpoint returns 200"
fi

# Test 3: Movie search endpoint (OMDB)
echo "Test 3: Movie search endpoint"
SEARCH_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/movies/search?query=Inception&page=1")
HTTP_CODE=$(echo "$SEARCH_RESPONSE" | tail -1)
BODY=$(echo "$SEARCH_RESPONSE" | sed $d)

if [ "$HTTP_CODE" != "200" ]; then
    echo "  ❌ FAILED - Expected HTTP 200, got $HTTP_CODE"
    FAILED=$((FAILED + 1))
elif ! echo "$BODY" | grep -q '"success":true'; then
    echo "  ❌ FAILED - Response missing success field"
    FAILED=$((FAILED + 1))
elif ! echo "$BODY" | grep -q '"movies":\['; then
    echo "  ❌ FAILED - Response missing movies array"
    FAILED=$((FAILED + 1))
else
    MOVIE_COUNT=$(echo "$BODY" | grep -o '"imdbID"' | wc -l | tr -d ' ')
    echo "  ✓ PASSED - Search returned $MOVIE_COUNT movies"
fi

# Test 4: Trending movies endpoint
echo "Test 4: Trending movies endpoint"
TRENDING_RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/movies/trending/popular")
HTTP_CODE=$(echo "$TRENDING_RESPONSE" | tail -1)
BODY=$(echo "$TRENDING_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
    echo "  ❌ FAILED - Expected HTTP 200, got $HTTP_CODE"
    FAILED=$((FAILED + 1))
elif ! echo "$BODY" | grep -q '"success":true'; then
    echo "  ❌ FAILED - Response missing success field"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Trending endpoint returns data"
fi

# Test 5: CORS headers
echo "Test 5: CORS headers"
CORS_RESPONSE=$(curl -s -I "$BACKEND_URL/api/v1/health")
if ! echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo "  ❌ FAILED - Missing CORS headers"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - CORS headers present"
fi

echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All backend tests passed (5/5)"
    exit 0
else
    echo "❌ $FAILED backend test(s) failed"
    exit 1
fi
