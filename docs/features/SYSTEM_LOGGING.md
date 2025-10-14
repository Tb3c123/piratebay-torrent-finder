# System Logging & Monitoring

Complete logging system for all backend operations with success/failure tracking.

## Overview

All system operations are now logged with detailed information including:

- ✅ **Success Status** - All responses include `success: true/false`
- 📝 **Operation Details** - What happened and when
- 📊 **Metrics** - Performance and resource usage data
- ⚠️ **Error Tracking** - Full error messages and stack traces
- 🔍 **Request Context** - Who/what triggered the operation

## Log Levels

### Available Levels

- **`INFO`** 🔵 - General information (health checks, stats requests)
- **`SUCCESS`** 🟢 - Successful operations (cache cleared, data retrieved)
- **`WARNING`** 🟡 - Important events (logs cleared, restart initiated)
- **`ERROR`** 🔴 - Failures and exceptions
- **`DEBUG`** ⚪ - Detailed debugging information

## System Operations Logging

### 1. Cache Management

#### **Clear Cache** - `POST /api/system/cache/clear/:type`

**Logged Information**:

```json
{
  "level": "info",
  "message": "Cache cleared: omdb",
  "data": {
    "cleared": ["OMDB API cache"]
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "cleared": ["OMDB API cache"]
}
```

**On Error**:

```json
{
  "success": false,
  "error": "Failed to clear cache",
  "message": "Invalid cache type"
}
```

#### **Get Cache Stats** - `GET /api/system/cache/stats`

**Logged Information**:

```json
{
  "level": "success",
  "message": "Cache stats retrieved",
  "data": {
    "totalCaches": 6,
    "stats": [
      {"cache": "omdb", "size": 5, "ttl": "60 minutes"},
      {"cache": "anime", "size": 2, "ttl": "60 minutes"}
    ]
  }
}
```

**Response**:

```json
{
  "success": true,
  "stats": {
    "omdb": {"size": 5, "ttl": "60 minutes"},
    "movies": {"size": 10, "ttl": "60 minutes"},
    "torrents": {"size": 15, "ttl": "30 minutes"},
    "sections": {"size": 3, "ttl": "15 minutes"},
    "anime": {"size": 2, "ttl": "60 minutes"},
    "animeSearch": {"size": 8, "ttl": "15 minutes"}
  }
}
```

### 2. Health Check

#### **Get Health** - `GET /api/system/health`

**Logged Information**:

```json
{
  "level": "info",
  "message": "Health check performed",
  "data": {
    "status": "healthy",
    "uptime": "15 minutes",
    "memoryUsedMB": 18
  }
}
```

**Response**:

```json
{
  "success": true,
  "status": "healthy",
  "uptime": 905.234,
  "memory": {
    "rss": 50245632,
    "heapTotal": 17924096,
    "heapUsed": 16432528,
    "external": 3478270,
    "arrayBuffers": 158404
  },
  "timestamp": "2025-10-13T09:24:01.471Z"
}
```

**On Error**:

```json
{
  "success": false,
  "status": "unhealthy",
  "error": "Error message"
}
```

### 3. Server Restart

#### **Restart Server** - `POST /api/system/restart`

**Logged Information**:

```json
{
  "level": "warning",
  "message": "Server restart initiated",
  "data": {
    "source": "system",
    "requestedBy": "::1",
    "timestamp": "2025-10-13T09:24:01.471Z"
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Server restart initiated. Please wait 5 seconds."
}
```

## Logs Management

### 1. Get Logs

#### **Fetch All Logs** - `GET /api/logs?level={level}&limit={limit}`

**Parameters**:

- `level` (optional): Filter by level (info, success, warning, error, debug)
- `limit` (optional): Max logs to return (default: 100)

**Logged Information** (10% sampling to avoid spam):

```json
{
  "level": "debug",
  "message": "Logs accessed",
  "data": {
    "level": "all",
    "limit": 100,
    "returned": 50,
    "total": 150
  }
}
```

**Response**:

```json
{
  "success": true,
  "logs": [
    {
      "id": 1697234561234.567,
      "timestamp": "2025-10-13T09:24:01.471Z",
      "level": "info",
      "message": "Cache cleared: omdb",
      "data": {"cleared": ["OMDB API cache"]}
    }
  ],
  "total": 50,
  "limit": 100
}
```

**On Error**:

```json
{
  "success": false,
  "error": "Failed to fetch logs",
  "message": "Error details"
}
```

### 2. Clear Logs

#### **Delete All Logs** - `DELETE /api/logs`

**Logged Information** (after clearing):

```json
{
  "level": "warning",
  "message": "All logs cleared",
  "data": {
    "count": 150,
    "requestedBy": "::1",
    "timestamp": "2025-10-13T09:24:01.471Z"
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Logs cleared successfully",
  "clearedCount": 150
}
```

**Note**: The clear operation itself is logged AFTER clearing, so you'll always see at least 1 log entry after clearing.

**On Error**:

```json
{
  "success": false,
  "error": "Failed to clear logs",
  "message": "Error details"
}
```

### 3. Get Status

#### **System Status** - `GET /api/logs/status`

**Logged Information**:

```json
{
  "level": "info",
  "message": "System status checked",
  "data": {
    "uptime": "15 minutes",
    "logsCount": 150,
    "memoryUsedMB": 18
  }
}
```

**Response**:

```json
{
  "success": true,
  "status": "running",
  "uptime": 905.234,
  "memory": {
    "rss": 50245632,
    "heapTotal": 17924096,
    "heapUsed": 16432528
  },
  "logs_count": 150,
  "timestamp": "2025-10-13T09:24:01.471Z"
}
```

## Usage Examples

### Monitor Cache Operations

```bash
# Clear specific cache
curl -X POST http://localhost:3001/api/system/cache/clear/anime
# Response: {"success": true, "message": "Cache cleared successfully", "cleared": ["Anime details cache"]}

# Get cache statistics
curl http://localhost:3001/api/system/cache/stats
# Response: {"success": true, "stats": {...}}

# Check logs
curl "http://localhost:3001/api/logs?limit=5"
# See both operations logged
```

### Track Errors

```bash
# Get only error logs
curl "http://localhost:3001/api/logs?level=error&limit=20"

# Response format
{
  "success": true,
  "logs": [
    {
      "level": "error",
      "message": "Failed to search torrents",
      "data": {
        "error": "Connection timeout",
        "query": "One Piece"
      }
    }
  ],
  "total": 5,
  "limit": 20
}
```

### Monitor System Health

```bash
# Check health
curl http://localhost:3001/api/system/health

# Get system status
curl http://localhost:3001/api/logs/status

# Both are logged automatically
```

### Clear Logs Periodically

```bash
# Clear all logs
curl -X DELETE http://localhost:3001/api/logs

# Response
{
  "success": true,
  "message": "Logs cleared successfully",
  "clearedCount": 150
}

# The clear operation itself is logged
curl "http://localhost:3001/api/logs?limit=1"
# Returns: [{"level": "warning", "message": "All logs cleared", ...}]
```

## Frontend Integration

### System Logs Page

The frontend displays all logged operations at **<http://localhost:3000/logs>**

**Features**:

- ✅ Real-time log viewing
- 🎨 Color-coded by level
- 📊 Cache statistics
- 🗑️ Clear logs button
- 🔄 Auto-refresh capability
- 🎯 Filter by log level

### Log Display Colors

- 🔵 **INFO** - Blue text
- 🟢 **SUCCESS** - Green text
- 🟡 **WARNING** - Yellow/Orange text
- 🔴 **ERROR** - Red text
- ⚪ **DEBUG** - Gray text

## Best Practices

### 1. Log Everything Important

✅ **Always log**:

- Cache operations (clear, stats)
- System operations (restart, health)
- Error conditions
- User-triggered actions

### 2. Include Context

✅ **Good logging**:

```javascript
addLog(LOG_LEVELS.INFO, 'Cache cleared: anime', {
  cleared: ['Anime details cache'],
  requestedBy: req.ip
});
```

❌ **Bad logging**:

```javascript
addLog(LOG_LEVELS.INFO, 'Cache cleared');
```

### 3. Use Appropriate Levels

- **INFO**: Normal operations
- **SUCCESS**: Confirmed successful operations
- **WARNING**: Important but not critical
- **ERROR**: Failures that need attention
- **DEBUG**: Detailed debugging info (use sparingly)

### 4. Monitor Regularly

```bash
# Check for errors daily
curl "http://localhost:3001/api/logs?level=error"

# Monitor system health
curl http://localhost:3001/api/system/health

# Clear logs weekly
curl -X DELETE http://localhost:3001/api/logs
```

## Performance Considerations

### Log Limits

- **Max logs stored**: 1000 entries
- **Oldest logs removed**: Automatically when limit reached
- **Response limit**: Default 100, max configurable

### Sampling

- Log fetching is sampled (10%) to avoid spam in logs
- This prevents "infinite loop" of logging log requests

## Troubleshooting

### No Logs Appearing

**Problem**: Logs not showing in `/logs` page

**Solutions**:

1. Check backend is running: `curl http://localhost:3001/api/system/health`
2. Verify logging is enabled: `curl http://localhost:3001/api/logs`
3. Check backend logs: `docker logs piratebay-backend`

### Logs Filling Up

**Problem**: Too many logs, performance degradation

**Solutions**:

1. Clear logs: `curl -X DELETE http://localhost:3001/api/logs`
2. Reduce log retention (modify `MAX_LOGS` in `backend/src/routes/logs.js`)
3. Implement log rotation (future enhancement)

### Missing Error Details

**Problem**: Error logs don't show enough information

**Solutions**:

1. Check `data` field in log entry
2. Look for `stack` property for stack traces
3. Check console logs: `docker logs piratebay-backend --tail 50`

## API Summary

| Method | Endpoint | Description | Logged |
|--------|----------|-------------|--------|
| POST | `/api/system/cache/clear/:type` | Clear cache | ✅ Yes |
| GET | `/api/system/cache/stats` | Get cache stats | ✅ Yes |
| GET | `/api/system/health` | System health | ✅ Yes |
| POST | `/api/system/restart` | Restart server | ✅ Yes |
| GET | `/api/logs` | Get all logs | ✅ Sampled |
| DELETE | `/api/logs` | Clear all logs | ✅ Yes |
| GET | `/api/logs/status` | System status | ✅ Yes |

## Related Documentation

- **[Usage Guide](USAGE_GUIDE.md)** - General application usage
- **[Performance](PERFORMANCE_IMPROVEMENTS.md)** - Performance optimization details
- **[Anime Integration](ANIME_INTEGRATION.md)** - Anime API documentation

---

**All system operations are now tracked and logged! 📝✅**
