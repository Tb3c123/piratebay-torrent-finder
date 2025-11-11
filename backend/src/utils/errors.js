/**
 * Custom Error Classes
 * Provides standardized error handling across the application
 */

/**
 * Base API Error class
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * 400 Bad Request - Invalid input
 */
class BadRequestError extends ApiError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}

/**
 * 401 Unauthorized - Authentication required
 */
class UnauthorizedError extends ApiError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
class ForbiddenError extends ApiError {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

/**
 * 404 Not Found - Resource not found
 */
class NotFoundError extends ApiError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

/**
 * 409 Conflict - Resource conflict (e.g., duplicate user)
 */
class ConflictError extends ApiError {
    constructor(message = 'Conflict') {
        super(409, message);
    }
}

/**
 * 422 Unprocessable Entity - Validation error
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation Error', errors = {}) {
        super(422, message);
        this.errors = errors;
    }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends ApiError {
    constructor(message = 'Internal Server Error') {
        super(500, message);
    }
}

/**
 * 503 Service Unavailable - External service error
 */
class ServiceUnavailableError extends ApiError {
    constructor(message = 'Service Unavailable') {
        super(503, message);
    }
}

module.exports = {
    ApiError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError,
    ServiceUnavailableError
};
