# Validators

Input validation utilities for the backend API.

## Overview

Validators provide reusable validation logic that can be used in routes via middleware. This separates validation concerns from business logic and provides consistent error responses.

## Structure

```text
validators/
├── index.js              # Central export
├── common.js             # Reusable validation utilities
├── authValidator.js      # Auth-specific validators
├── settingsValidator.js  # Settings validators
└── torrentValidator.js   # Torrent validators
```

## Usage

### With Middleware (Recommended)

```javascript
const { validateBody } = require('../middleware/validator');
const { auth } = require('../validators');

// In route
router.post('/register',
    validateBody(auth.validateRegistration),
    async (req, res) => {
        // req.validated contains sanitized/validated data
        const { username, password } = req.validated;
        // ... rest of logic
    }
);
```

### Direct Usage

```javascript
const { auth } = require('../validators');

try {
    const validated = auth.validateRegistration(req.body);
    // Use validated data
} catch (error) {
    if (error instanceof ValidationError) {
        // Handle validation error
    }
}
```

## Available Validators

### Common Validators (`common.js`)

**Basic Validation:**

- `validateRequired(data, fields)` - Check required fields
- `validateStringLength(value, fieldName, min, max)` - String length validation
- `validateNumberRange(value, fieldName, min, max)` - Number range validation

**Format Validation:**

- `validateUsername(username)` - Username format (3-30 chars, alphanumeric + _-)
- `validatePassword(password)` - Password strength (6-100 chars)
- `validateUrl(url, fieldName)` - Valid URL format
- `validateEmail(email)` - Email format

**Utilities:**

- `sanitizeString(str)` - Remove HTML tags and trim

### Auth Validators (`authValidator.js`)

**`validateRegistration(data)`**

- Validates: `{ username, password }`
- Returns: Sanitized data
- Checks: Required fields, username format, password strength

**`validateLogin(data)`**

- Validates: `{ username, password }`
- Returns: Sanitized data
- Checks: Required fields present

### Settings Validators (`settingsValidator.js`)

**`validateQBittorrentSettings(settings)`**

- Validates: `{ url, username, password }`
- Returns: Clean settings with normalized URL
- Checks: Valid URL, required fields

**`validateJellyfinSettings(settings)`**

- Validates: `{ url, apiKey, libraries }`
- Returns: Clean settings
- Checks: Valid URL, API key present, libraries is array

**`validateSettingsUpdate(data)`**

- Validates: `{ qbittorrent?, jellyfin? }`
- Returns: Validated settings object
- Checks: At least one settings type provided

### Torrent Validators (`torrentValidator.js`)

**`validateSearchQuery(query)`**

- Validates: `{ query, category?, page? }`
- Returns: Sanitized query with defaults
- Checks: Query length (2-200 chars), valid category, page range (0-100)

**`validateMagnetLink(magnetLink)`**

- Validates: Magnet link string
- Checks: Starts with "magnet:?", length < 2000

**`validateTorrentDownload(data)`**

- Validates: `{ magnetLink, savePath?, userId }`
- Returns: Validated download data
- Checks: Valid magnet link, userId present

**`validateImdbId(imdbId)`**

- Validates: IMDB ID string
- Checks: Format "tt1234567" (2-9 digits)

## Validation Middleware

Located in `middleware/validator.js`:

**`validate(validatorFn, source)`**

- Generic validation middleware
- `source`: 'body', 'query', or 'params'

**`validateBody(validatorFn)`**

- Validates request body

**`validateQuery(validatorFn)`**

- Validates query parameters

**`validateParams(validatorFn)`**

- Validates route parameters

## Example: Migrating a Route

### Before (Old Pattern)

```javascript
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                error: 'Username and password are required'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                error: 'Username must be at least 3 characters'
            });
        }

        // ... more validation
        // ... business logic
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### After (New Pattern)

```javascript
const { validateBody } = require('../middleware/validator');
const { auth } = require('../validators');
const { asyncHandler } = require('../utils/helpers');
const { createdResponse } = require('../utils/response');

router.post('/register',
    validateBody(auth.validateRegistration),
    asyncHandler(async (req, res) => {
        const { username, password } = req.validated;

        const user = await authService.registerUser(username, password);
        createdResponse(res, user, 'User registered successfully');
    })
);
```

### Benefits

✅ **Cleaner Routes:** Logic separated from validation
✅ **Reusable:** Same validators across multiple routes
✅ **Consistent Errors:** Standard validation error format
✅ **Type Safety:** Validated data structure is known
✅ **Testable:** Easy to unit test validators

## Error Format

Validation errors return 422 status with format:

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "username": "Username must be at least 3 characters",
    "password": "Password is required"
  }
}
```

## Testing Validators

```javascript
const { auth } = require('./validators');
const { ValidationError } = require('./utils/errors');

try {
    // Valid data
    const result = auth.validateRegistration({
        username: 'testuser',
        password: 'password123'
    });
    console.log('Valid:', result);
} catch (error) {
    if (error instanceof ValidationError) {
        console.log('Errors:', error.errors);
    }
}
```

## Adding New Validators

1. **Create validator file** in `validators/`
2. **Use common utilities** from `common.js`
3. **Export validators** in `index.js`
4. **Document usage** in this README

Example:

```javascript
// validators/movieValidator.js
const { validateRequired, validateImdbId } = require('./common');

const validateMovieSearch = (data) => {
    validateRequired(data, ['title']);
    // ... more validation
    return { title: data.title };
};

module.exports = { validateMovieSearch };

// validators/index.js
module.exports = {
    // ... existing
    movie: require('./movieValidator')
};
```

## Migration Checklist

When migrating a route:

- [ ] Identify validation logic in route
- [ ] Create/use appropriate validator
- [ ] Add validation middleware to route
- [ ] Update route to use `req.validated`
- [ ] Remove inline validation code
- [ ] Test with valid/invalid data
- [ ] Update route documentation

## Next Steps

- **PR #3:** Create models & repositories
- **PR #4:** Migrate routes to use validators
- Gradually refactor all routes

## See Also

- [Utilities](../utils/README.md) - Error classes and helpers
- [Middleware](../middleware/) - Auth and error handlers
