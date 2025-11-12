#!/bin/bash

# Test all API endpoints and document their response formats
# This helps ensure frontend parsers match backend responses

API_URL="http://localhost:3001"
TOKEN=""

echo "🧪 Testing All API Response Formats"
echo "===================================="
echo ""

# Get auth token first
echo "1️⃣ Getting Auth Token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"hieunth","password":"Khongdung1"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('data', {}).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Login response:"
  echo "$LOGIN_RESPONSE" | python3 -m json.tool
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."
echo ""

# Test function
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local auth="$4"
  local body="$5"

  echo "📍 Testing: $name"
  echo "   Endpoint: $method $endpoint"

  if [ "$auth" = "yes" ]; then
    if [ -n "$body" ]; then
      RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$body")
    else
      RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
        -H "Authorization: Bearer $TOKEN")
    fi
  else
    if [ -n "$body" ]; then
      RESPONSE=$(curl -s -X "$method" "$API_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$body")
    else
      RESPONSE=$(curl -s "$API_URL$endpoint")
    fi
  fi

  # Parse response structure
  echo "$RESPONSE" | python3 << 'PYEOF'
import sys, json
try:
    data = json.load(sys.stdin)

    # Check top level
    has_success = 'success' in data
    has_data = 'data' in data
    has_error = 'error' in data
    has_message = 'message' in data

    print(f"   Response Structure:")
    print(f"     • success: {has_success} = {data.get('success', 'N/A')}")

    if has_data:
        data_obj = data['data']
        data_type = type(data_obj).__name__
        print(f"     • data: {data_type}")

        if isinstance(data_obj, dict):
            keys = list(data_obj.keys())[:5]  # First 5 keys
            print(f"       Keys: {keys}")

            # Check nested structure
            if 'movies' in data_obj:
                movies = data_obj['movies']
                print(f"       → movies: {type(movies).__name__} (length: {len(movies) if isinstance(movies, list) else 'N/A'})")
            if 'movie' in data_obj:
                print(f"       → movie: dict")
            if 'torrents' in data_obj:
                torrents = data_obj['torrents']
                print(f"       → torrents: {type(torrents).__name__} (length: {len(torrents) if isinstance(torrents, list) else 'N/A'})")
            if 'settings' in data_obj:
                print(f"       → settings: dict")
            if 'token' in data_obj:
                print(f"       → token: string")
            if 'user' in data_obj:
                print(f"       → user: dict")

        elif isinstance(data_obj, list):
            print(f"       Length: {len(data_obj)}")
            if len(data_obj) > 0:
                first = data_obj[0]
                if isinstance(first, dict):
                    print(f"       First item keys: {list(first.keys())[:5]}")

    if has_error:
        print(f"     • error: {data.get('error')}")
    if has_message:
        print(f"     • message: {data.get('message')}")

    # Frontend parsing suggestion
    print(f"   Frontend should use:")
    if has_data:
        data_obj = data['data']
        if isinstance(data_obj, dict):
            if 'movies' in data_obj:
                print(f"     → response.data.data.movies")
            elif 'movie' in data_obj:
                print(f"     → response.data.data.movie")
            elif 'torrents' in data_obj:
                print(f"     → response.data.data.torrents")
            elif 'settings' in data_obj:
                print(f"     → response.data.data.settings")
            elif 'token' in data_obj and 'user' in data_obj:
                print(f"     → response.data.data.token & response.data.data.user")
            else:
                print(f"     → response.data.data")
        elif isinstance(data_obj, list):
            print(f"     → response.data.data (array)")

except json.JSONDecodeError as e:
    print(f"   ❌ Invalid JSON: {e}")
except Exception as e:
    print(f"   ❌ Error: {e}")
PYEOF

  echo ""
}

# PUBLIC ENDPOINTS (No Auth)
echo "═══════════════════════════════════"
echo "PUBLIC ENDPOINTS"
echo "═══════════════════════════════════"
echo ""

test_endpoint "Movies - Trending Now" "GET" "/api/v1/movies/trending/now" "no"
test_endpoint "Movies - Popular" "GET" "/api/v1/movies/trending/popular" "no"
test_endpoint "Movies - Latest" "GET" "/api/v1/movies/latest" "no"
test_endpoint "Movies - Search" "GET" "/api/v1/movies/search?query=matrix&page=1" "no"
test_endpoint "Movies - Detail" "GET" "/api/v1/movies/tt0133093" "no"
test_endpoint "Movies - Torrents" "GET" "/api/v1/movies/tt0133093/torrents" "no"

test_endpoint "Torrent - Search" "GET" "/api/v1/torrent/search?q=matrix&page=1" "no"
test_endpoint "Torrent - Detail" "GET" "/api/v1/torrent/1" "no"

# AUTH ENDPOINTS
echo "═══════════════════════════════════"
echo "AUTHENTICATED ENDPOINTS"
echo "═══════════════════════════════════"
echo ""

test_endpoint "Auth - Me" "GET" "/api/v1/auth/me" "yes"
test_endpoint "Settings - Get" "GET" "/api/v1/settings" "yes"
test_endpoint "History - Get" "GET" "/api/v1/history" "yes"
test_endpoint "Downloads - List" "GET" "/api/v1/downloads" "yes"

# ADMIN ENDPOINTS (may fail if not admin)
echo "═══════════════════════════════════"
echo "ADMIN ENDPOINTS (May Fail)"
echo "═══════════════════════════════════"
echo ""

test_endpoint "Admin - Users" "GET" "/api/v1/auth/admin/users" "yes"
test_endpoint "Admin - Logs" "GET" "/api/v1/admin/logs" "yes"

echo "═══════════════════════════════════"
echo "✅ Test Complete!"
echo "═══════════════════════════════════"
