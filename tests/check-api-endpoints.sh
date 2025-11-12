#!/bin/bash
# Check that frontend uses correct /api/v1/ endpoints

set -e

echo "🔍 Checking Frontend API Endpoints..."
echo ""

FAILED=0
FRONTEND_SRC="frontend/src"

# Check for old endpoints (without /v1/)
echo "Test 1: Checking for old /api/movies endpoints..."
OLD_MOVIES=$(grep -r "\/api\/movies" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/movies" | wc -l | tr -d ' ')
if [ "$OLD_MOVIES" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_MOVIES instances of /api/movies (should be /api/v1/movies)"
    grep -rn "\/api\/movies" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/movies"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All movie endpoints use /api/v1/movies"
fi

echo "Test 2: Checking for old /api/auth endpoints..."
OLD_AUTH=$(grep -r "\/api\/auth" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/auth" | wc -l | tr -d ' ')
if [ "$OLD_AUTH" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_AUTH instances of /api/auth (should be /api/v1/auth)"
    grep -rn "\/api\/auth" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/auth"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All auth endpoints use /api/v1/auth"
fi

echo "Test 3: Checking for old /api/settings endpoints..."
OLD_SETTINGS=$(grep -r "\/api\/settings" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/settings" | wc -l | tr -d ' ')
if [ "$OLD_SETTINGS" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_SETTINGS instances of /api/settings (should be /api/v1/settings)"
    grep -rn "\/api\/settings" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/settings"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All settings endpoints use /api/v1/settings"
fi

echo "Test 4: Checking for old /api/qbittorrent endpoints..."
OLD_QB=$(grep -r "\/api\/qbittorrent" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/qbittorrent" | wc -l | tr -d ' ')
if [ "$OLD_QB" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_QB instances of /api/qbittorrent (should be /api/v1/qbittorrent)"
    grep -rn "\/api\/qbittorrent" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/qbittorrent"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All qbittorrent endpoints use /api/v1/qbittorrent"
fi

echo "Test 5: Checking for old /api/history endpoints..."
OLD_HISTORY=$(grep -r "\/api\/history" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/history" | wc -l | tr -d ' ')
if [ "$OLD_HISTORY" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_HISTORY instances of /api/history (should be /api/v1/history)"
    grep -rn "\/api\/history" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/history"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All history endpoints use /api/v1/history"
fi

echo "Test 6: Checking for old /api/search endpoints..."
OLD_SEARCH=$(grep -r "\/api\/search" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/search" | wc -l | tr -d ' ')
if [ "$OLD_SEARCH" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_SEARCH instances of /api/search (should be /api/v1/search)"
    grep -rn "\/api\/search" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/search"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All search endpoints use /api/v1/search"
fi

echo "Test 7: Checking for old /api/torrent endpoints..."
OLD_TORRENT=$(grep -r "\/api\/torrent" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/torrent" | wc -l | tr -d ' ')
if [ "$OLD_TORRENT" -gt 0 ]; then
    echo "  ❌ FAILED - Found $OLD_TORRENT instances of /api/torrent (should be /api/v1/torrent)"
    grep -rn "\/api\/torrent" $FRONTEND_SRC --include="*.ts" --include="*.tsx" | grep -v "\/api\/v1\/torrent"
    FAILED=$((FAILED + 1))
else
    echo "  ✓ PASSED - All torrent endpoints use /api/v1/torrent"
fi

echo ""
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo "✅ All API endpoint checks passed!"
    exit 0
else
    echo "❌ $FAILED API endpoint check(s) failed"
    echo ""
    echo "Fix: Run the following command to update endpoints:"
    echo "  cd frontend && find src -name '*.ts' -o -name '*.tsx' | xargs sed -i '' \\"
    echo "    -e 's|/api/movies|/api/v1/movies|g' \\"
    echo "    -e 's|/api/auth|/api/v1/auth|g' \\"
    echo "    -e 's|/api/settings|/api/v1/settings|g' \\"
    echo "    -e 's|/api/qbittorrent|/api/v1/qbittorrent|g' \\"
    echo "    -e 's|/api/history|/api/v1/history|g' \\"
    echo "    -e 's|/api/search|/api/v1/search|g' \\"
    echo "    -e 's|/api/torrent|/api/v1/torrent|g'"
    exit 1
fi
