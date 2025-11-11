# Models & Repositories

Data models and repository pattern implementation for clean database access.

## Overview

This layer separates data structures (Models) from database operations (Repositories), providing a clean API for data access throughout the application.

## Architecture

```text
┌─────────────┐
│   Routes    │ ← Uses repositories to access data
└──────┬──────┘
       │
┌──────▼──────────┐
│  Repositories   │ ← Handles all database queries
└──────┬──────────┘
       │
┌──────▼──────┐
│   Models    │ ← Represents data structure
└─────────────┘
```

## Structure

```text
models/
├── index.js         # Central export
├── User.js          # User model
├── Settings.js      # Settings model
├── SearchHistory.js # Search history model
└── Log.js           # Log model

repositories/
├── index.js                  # Central export & factory
├── UserRepository.js         # User data access
├── SettingsRepository.js     # Settings data access
├── SearchHistoryRepository.js # History data access
└── LogRepository.js          # Log data access
```

## Models

Models represent data entities with conversion methods and validation.

### User Model

```javascript
const { User } = require('./models');

const user = new User({
    id: 1,
    username: 'testuser',
    password: 'hashed...',
    created_at: '2024-01-01T00:00:00Z'
});

// Convert to JSON (excludes password)
const json = user.toJSON();
// { id: 1, username: 'testuser', createdAt: '...' }

// Convert to database format
const dbData = user.toDatabase();
```

### Settings Model

```javascript
const { Settings } = require('./models');

const settings = new Settings({
    user_id: 1,
    qbittorrent: '{"url":"http://localhost:8080"}',
    jellyfin: '{"url":"http://localhost:8096"}'
});

// Check if configured
settings.hasQBittorrent(); // true
settings.hasJellyfin();    // true

// Access parsed JSON
settings.qbittorrent.url; // 'http://localhost:8080'
```

### SearchHistory Model

```javascript
const { SearchHistory } = require('./models');

// Create new entry
const history = SearchHistory.create(userId, 'Inception', 'movies');
```

### Log Model

```javascript
const { Log } = require('./models');

// Create different log levels
const infoLog = Log.info(userId, 'User login', 'Success');
const warningLog = Log.warning(userId, 'Slow API', 'Took 5s');
const errorLog = Log.error(userId, 'Download failed', 'Connection timeout');
```

## Repositories

Repositories provide clean database access with promises.

### UserRepository

```javascript
const { createRepositories } = require('./repositories');
const repos = createRepositories(db);

// Create user
const user = await repos.users.create('username', 'hashedPassword');

// Find user
const user = await repos.users.findById(1);
const user = await repos.users.findByUsername('testuser');

// Check existence
const exists = await repos.users.usernameExists('testuser');

// Get all users
const users = await repos.users.findAll();

// Update user
await repos.users.update(userId, { username: 'newname' });

// Delete user
await repos.users.delete(userId);

// Count users
const count = await repos.users.count();
```

### SettingsRepository

```javascript
// Get or create settings
const settings = await repos.settings.getOrCreate(userId);

// Find by user
const settings = await repos.settings.findByUserId(userId);

// Update settings
await repos.settings.update(userId, {
    qbittorrent: { url: 'http://localhost:8080', username: 'admin', password: 'pass' },
    jellyfin: { url: 'http://localhost:8096', apiKey: 'key' }
});

// Update specific service
await repos.settings.updateQBittorrent(userId, qbSettings);
await repos.settings.updateJellyfin(userId, jellyfinSettings);

// Get specific service settings
const qb = await repos.settings.getQBittorrent(userId);
const jf = await repos.settings.getJellyfin(userId);
```

### SearchHistoryRepository

```javascript
// Create history entry
await repos.searchHistory.create(userId, 'Inception', 'movies');

// Get user history
const history = await repos.searchHistory.findByUserId(userId, 50);

// Get recent unique searches
const recent = await repos.searchHistory.getRecentUnique(userId, 10);

// Get popular searches (all users)
const popular = await repos.searchHistory.getPopular(10);

// Clear history
await repos.searchHistory.clearByUserId(userId);
await repos.searchHistory.clearAll(); // admin only

// Delete specific entry
await repos.searchHistory.delete(historyId, userId);

// Count entries
const count = await repos.searchHistory.countByUserId(userId);
```

### LogRepository

```javascript
// Create logs
await repos.logs.info(userId, 'User login', 'Success');
await repos.logs.warning(userId, 'Slow response', 'API took 5s');
await repos.logs.error(userId, 'Failed download', 'Connection timeout');

// Find logs
const userLogs = await repos.logs.findByUserId(userId, 100);
const allLogs = await repos.logs.findAll(200);
const errorLogs = await repos.logs.findByLevel('error', 50);

// Get statistics
const stats = await repos.logs.getStatistics();
// { total: 150, info: 100, warning: 30, error: 20 }

// Clear logs
await repos.logs.clearByUserId(userId);
await repos.logs.clearAll();
await repos.logs.clearOldLogs(30); // Clear logs older than 30 days

// Count logs
const count = await repos.logs.countByUserId(userId);
const errorCount = await repos.logs.countByLevel('error');
```

## Usage in Routes

### Before (Direct DB Access)

```javascript
router.get('/settings', authenticateToken, (req, res) => {
    const userId = req.user.id;

    db.get('SELECT * FROM settings WHERE user_id = ?', [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const settings = {
            qbittorrent: row.qbittorrent ? JSON.parse(row.qbittorrent) : null,
            jellyfin: row.jellyfin ? JSON.parse(row.jellyfin) : null
        };

        res.json(settings);
    });
});
```

### After (Repository Pattern)

```javascript
const { asyncHandler } = require('../utils/helpers');
const { successResponse } = require('../utils/response');

router.get('/settings',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const settings = await req.repos.settings.getOrCreate(userId);
        successResponse(res, settings.toJSON());
    })
);
```

## Initialization

Add repositories to request object in `index.js`:

```javascript
const { createRepositories } = require('./repositories');

// After database initialization
const repos = createRepositories(db);

// Add to all requests
app.use((req, res, next) => {
    req.repos = repos;
    next();
});
```

## Benefits

✅ **Separation of Concerns**: Database logic separate from business logic

✅ **Reusability**: Same repository methods used across routes

✅ **Testability**: Easy to mock repositories for testing

✅ **Type Safety**: Models ensure consistent data structure

✅ **Maintainability**: Database queries in one place

✅ **Migration Ready**: Easy to switch databases (SQLite → PostgreSQL)

## Testing

Run the test suite:

```bash
node src/test-models-repos.js
```

Tests cover:

- CRUD operations for all repositories
- Model conversions (toJSON, toDatabase)
- Data integrity and validation
- Repository factory pattern

## Migration Plan

1. ✅ Create models and repositories (PR #3)
2. Add repositories to request object
3. Gradually migrate routes to use repositories
4. Remove direct DB access from routes
5. Add repository-level caching if needed

## Next Steps

- **PR #4**: Integrate repositories into existing routes
- **PR #5**: Add service layer on top of repositories
- **PR #6**: Split large route files

## See Also

- [Utilities](../utils/README.md) - Error handling and helpers
- [Validators](../validators/README.md) - Input validation
- [Middleware](../middleware/) - Authentication and validation
