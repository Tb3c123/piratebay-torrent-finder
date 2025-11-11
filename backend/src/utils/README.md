# Backend Utilities & Error Handling

## Overview

This directory contains reusable utilities and standardized error handling for the backend.

## Files

### `errors.js` - Custom Error Classes

Provides standardized error classes for different HTTP status codes:

```javascript
const {
    BadRequestError,      // 400
    UnauthorizedError,    // 401
    ForbiddenError,       // 403
    NotFoundError,        // 404
    ConflictError,        // 409
    ValidationError,      // 422
    InternalServerError,  // 500
    ServiceUnavailableError // 503
} = require('./utils/errors');

// Usage in routes
throw new BadRequestError('Invalid input');
throw new UnauthorizedError('Invalid credentials');
throw new NotFoundError('User not found');
```

### `response.js` - Response Formatter

Standardized response functions:

```javascript
const {
    successResponse,
    createdResponse,
    errorResponse,
    validationErrorResponse,
    paginatedResponse
} = require('./utils/response');

// Success response
successResponse(res, { user }, 'Login successful');
// Returns: { success: true, data: { user }, message: '...' }

// Created response (201)
createdResponse(res, { user }, 'User created');
// Returns: { success: true, data: { user }, message: '...' } (201)

// Error response
errorResponse(res, 'Something went wrong', 500);
// Returns: { success: false, error: '...' } (500)

// Validation error
validationErrorResponse(res, { email: 'Invalid email' });
// Returns: { success: false, error: 'Validation failed', errors: {...} } (422)
```

### `logger.js` - Logging Utility

Consistent logging with colors and file persistence:

```javascript
const logger = require('./utils/logger');

logger.info('Server started');
logger.warn('Deprecated API called', { endpoint: '/old-api' });
logger.error('Database connection failed', { error: err.message });
logger.debug('Cache hit', { key: 'user:123' });
```

Features:

- Color-coded console output
- Automatic file persistence for errors/warnings
- Backward compatible with existing logs.json
- Automatic log rotation (keeps last 1000 entries)

### `helpers.js` - Common Utilities

Reusable helper functions:

```javascript
const {
    asyncHandler,
    isValidJSON,
    sanitizeObject,
    sleep,
    generateRandomString,
    parseBoolean,
    deepClone,
    isEmptyObject,
    formatBytes
} = require('./utils/helpers');

// Async error handler wrapper
router.get('/users', asyncHandler(async (req, res) => {
    const users = await getUsers(); // Errors automatically caught
    successResponse(res, users);
}));

// Other utilities
const clean = sanitizeObject({ a: 1, b: null, c: undefined }); // { a: 1 }
const random = generateRandomString(16); // '9xKzP...'
const size = formatBytes(1536); // '1.5 KB'
```

## Migration Guide

### Old Pattern

```javascript
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const user = await authService.login(username, password);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
```

### New Pattern

```javascript
const { asyncHandler } = require('../utils/helpers');
const { successResponse } = require('../utils/response');
const { BadRequestError } = require('../utils/errors');
const logger = require('../utils/logger');

router.post('/login', asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        throw new BadRequestError('Username and password required');
    }

    const user = await authService.login(username, password);
    logger.info('User logged in', { userId: user.id });

    successResponse(res, user, 'Login successful');
}));
```

### Benefits

✅ **Consistency:** All responses have same structure
✅ **Less Code:** No try-catch in every route
✅ **Better Errors:** Meaningful HTTP status codes
✅ **Easy Testing:** Standardized error handling
✅ **Better Logging:** Colored console + file persistence

## Error Handler Middleware

Located in `middleware/errorHandler.js`, this catches all errors:

- Custom ApiError instances → proper status codes
- JWT errors → 401
- Validation errors → 422
- Database errors → appropriate codes
- Unknown errors → 500

### Usage

Automatically applied in `index.js`:

```javascript
// 404 handler - catches routes that don't exist
app.use(notFoundHandler);

// Error handler - catches all errors
app.use(errorHandler);
```

## Backward Compatibility

✅ All existing routes continue to work
✅ Old logging still works (global.addLog)
✅ Old error responses still valid
✅ New utilities are opt-in

You can migrate routes incrementally without breaking anything!

## Next Steps

1. **PR #2:** Create validators for input validation
2. **PR #3:** Add models & repositories
3. **Gradually migrate** existing routes to use new utilities

## Examples

See `routes/auth.js` for migration examples (coming in next PR).
