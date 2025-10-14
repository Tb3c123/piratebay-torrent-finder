# 🚀 Quick Performance Reference

## Cache Status Check

### View Cache Hits (Real-time)

```bash
docker logs -f piratebay-backend | grep "Cache hit"
```

Expected output:

```
✓ Cache hit for movie: tt0133093
✓ Cache hit for search: Matrix (page 1)
✓ Cache hit for trending movies
✓ Cache hit for torrent 7349687
```

### Count Total Cache Hits

```bash
docker logs piratebay-backend | grep -c "Cache hit"
```

### View Parallel Operations

```bash
docker logs -f piratebay-backend | grep "parallel"
```

---

## Performance Testing

### Test Movie Search

```bash
# First request (no cache)
time curl -s "http://localhost:3001/api/movies/search?query=Matrix&page=1" | jq '.movies | length'

# Second request (cached)
time curl -s "http://localhost:3001/api/movies/search?query=Matrix&page=1" | jq '.movies | length'
```

Expected:

- First: ~0.4s
- Second: ~0.02s (20x faster)

### Test Movie Details

```bash
# First request
time curl -s "http://localhost:3001/api/movies/tt0133093" | jq '.movie.Title'

# Second request (cached)
time curl -s "http://localhost:3001/api/movies/tt0133093" | jq '.movie.Title'
```

Expected:

- First: ~0.4s
- Second: ~0.06s (7x faster)

### Test Torrent Details

```bash
# First request
time curl -s "http://localhost:3001/api/torrent/7349687" > /dev/null

# Second request (cached)
time curl -s "http://localhost:3001/api/torrent/7349687" > /dev/null
```

Expected:

- First: ~1.7s
- Second: ~0.02s (85x faster)

### Test Movie Sections

```bash
# Trending
time curl -s "http://localhost:3001/api/movies/trending/now" | jq '.movies | length'
time curl -s "http://localhost:3001/api/movies/trending/now" | jq '.movies | length'

# Popular
time curl -s "http://localhost:3001/api/movies/trending/popular" | jq '.movies | length'
time curl -s "http://localhost:3001/api/movies/trending/popular" | jq '.movies | length'

# Latest
time curl -s "http://localhost:3001/api/movies/latest" | jq '.movies | length'
time curl -s "http://localhost:3001/api/movies/latest" | jq '.movies | length'
```

---

## Cache Management

### Clear All Caches

```bash
# Restart backend container
docker-compose restart backend
```

### Monitor Memory Usage

```bash
docker stats piratebay-backend --no-stream
```

Expected: ~50-100MB (including cache)

---

## Cache Configuration

### Current TTL Settings

| Cache Type | TTL | Entries | Memory |
|-----------|-----|---------|---------|
| Search | 15 min | ~100 | ~2-5MB |
| Movie Details | 1 hour | ~200 | ~5-10MB |
| Torrent | 30 min | 100 max | ~5-10MB |
| Sections | 1 hour | 3 | ~50KB |

### Modify TTL (if needed)

**Search Cache** (`backend/src/services/omdb.js`):

```javascript
const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
```

**Movie Cache** (`backend/src/services/omdb.js`):

```javascript
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
```

**Torrent Cache** (`backend/src/routes/torrent.js`):

```javascript
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
```

**Section Cache** (`backend/src/routes/movies.js`):

```javascript
const SECTION_CACHE_TTL = 60 * 60 * 1000; // 1 hour
```

---

## Troubleshooting

### Cache Not Working?

**Check logs:**

```bash
docker logs piratebay-backend --tail 50 | grep -E "(Cache|cache)"
```

**Symptoms:**

- No "Cache hit" messages → Cache not being used
- All requests slow → Cache not storing data
- High memory usage → Cache growing too large

**Solutions:**

1. Restart backend: `docker-compose restart backend`
2. Check memory: `docker stats piratebay-backend`
3. Verify environment variables are set

### Slow First Request?

Normal! First requests:

- Fetch from external APIs (OMDB, TPB)
- Parse torrent files
- Store in cache

Subsequent requests are instant.

### Memory Leak?

**Monitor over time:**

```bash
while true; do
  docker stats piratebay-backend --no-stream | grep piratebay-backend
  sleep 60
done
```

Memory should stabilize at ~50-100MB and not grow indefinitely.

---

## Expected Performance

### Good Performance Indicators

✅ Cache hit rate > 70%
✅ Average response time < 100ms (cached)
✅ Memory usage 50-100MB
✅ No timeout errors

### Warning Signs

⚠️ Cache hit rate < 50%
⚠️ Average response time > 500ms
⚠️ Memory usage > 200MB
⚠️ Frequent timeout errors

---

## Quick Wins

### Increase Cache Hit Rate

1. **Longer TTL** (trade-off: stale data)

   ```javascript
   const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours
   ```

2. **More cache entries**

   ```javascript
   if (torrentCache.size > 200) { // Increased from 100
   ```

3. **Preload popular content**

   ```javascript
   // On server start
   preloadPopularMovies();
   ```

### Reduce Memory Usage

1. **Shorter TTL**

   ```javascript
   const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
   ```

2. **Fewer cache entries**

   ```javascript
   if (torrentCache.size > 50) { // Decreased from 100
   ```

3. **Cleanup more often**

   ```javascript
   setInterval(() => cleanupCache(), 2 * 60 * 1000); // Every 2 min
   ```

---

## Benchmarking Script

Save as `benchmark.sh`:

```bash
#!/bin/bash

echo "=== Performance Benchmark ==="
echo ""

echo "1. Movie Search (cold):"
time curl -s "http://localhost:3001/api/movies/search?query=Avatar" > /dev/null
echo ""

echo "2. Movie Search (warm):"
time curl -s "http://localhost:3001/api/movies/search?query=Avatar" > /dev/null
echo ""

echo "3. Movie Details (cold):"
time curl -s "http://localhost:3001/api/movies/tt0499549" > /dev/null
echo ""

echo "4. Movie Details (warm):"
time curl -s "http://localhost:3001/api/movies/tt0499549" > /dev/null
echo ""

echo "5. Trending Movies (cold):"
time curl -s "http://localhost:3001/api/movies/trending/now" > /dev/null
echo ""

echo "6. Trending Movies (warm):"
time curl -s "http://localhost:3001/api/movies/trending/now" > /dev/null
echo ""

echo "=== Cache Statistics ==="
docker logs piratebay-backend 2>&1 | grep -c "Cache hit"
```

Run:

```bash
chmod +x benchmark.sh
./benchmark.sh
```

---

**Last updated:** October 2025
