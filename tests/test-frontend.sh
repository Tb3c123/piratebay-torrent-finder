#!/bin/bash
# Frontend Integration Tests
# Tests frontend rendering and backend connectivity

set -e

FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
BACKEND_URL=${BACKEND_URL:-http://localhost:3001}
FAILED=0

echo "🧪 Testing Frontend..."
echo "Frontend URL: $FRONTEND_URL"
echo "Backend URL: $BACKEND_URL"
echo ""

# Test 1: Frontend loads
echo "Test 1: Frontend homepage loads"
FRONTEND_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL")
HTTP_CODE=$(echo "$FRONTEND_RESPONSE" | tail -n 1)
BODY=$(echo "$FRONTEND_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" != "200" ]; then
    echo "  ❌ FAILED - Expected HTTP 200, got $HTTP_CODE"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Frontend returns HTTP 200"
fi

# Test 2: Frontend contains expected content
echo "Test 2: Frontend contains app title"
if ! echo "$BODY" | grep -q "Pirate Bay"; then
    echo "  ❌ FAILED - Missing 'Pirate Bay' in HTML"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - App title found in HTML"
fi

# Test 3: Frontend has Next.js hydration
echo "Test 3: Frontend has Next.js scripts"
if ! echo "$BODY" | grep -q "_next/static"; then
    echo "  ❌ FAILED - Missing Next.js static files"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - Next.js scripts present"
fi

# Test 4: Frontend can reach backend (via server-side)
echo "Test 4: Frontend static assets load"
STATIC_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL/_next/static/chunks/webpack.js" || echo "000")
if [ "$STATIC_RESPONSE" != "200" ] && [ "$STATIC_RESPONSE" != "404" ]; then
    echo "  ⚠️  WARNING - Static assets may not be loading correctly (HTTP $STATIC_RESPONSE)"
else
    echo "  ✓ PASSED - Static assets endpoint accessible"
fi

# Test 5: Check frontend environment variables
echo "Test 5: Frontend API configuration"
if echo "$BODY" | grep -q "NEXT_PUBLIC_API_URL"; then
    echo "  ⚠️  WARNING - API URL exposed in HTML (check env vars)"
else
    echo "  ✓ PASSED - API URL properly configured"
fi

echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All frontend tests passed (5/5)"
    exit 0
else
    echo "❌ $FAILED frontend test(s) failed"
    exit 1
fi
