/**
 * Centralized Error Handler Middleware
 * Catches all errors and returns consistent error responses
 */

const { ApiError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Error handler middleware
 * Should be the last middleware in the chain
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;

    // Log error
    logger.error(`${req.method} ${req.path}`, {
        error: err.message,
        stack: err.stack,
        body: req.body,
        query: req.query
    });

    // Handle custom ApiError
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;

        // Include validation errors if available
        if (err.errors) {
            details = err.errors;
        }
    }
    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    // Handle MongoDB/Database errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        details = Object.values(err.errors).map(e => e.message);
    }
    else if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    }
    // Handle syntax errors
    else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON';
    }
    // Development: include stack trace
    else if (process.env.NODE_ENV === 'development') {
        details = {
            message: err.message,
            stack: err.stack
        };
    }

    // Send error response
    return errorResponse(res, message, statusCode, details);
};

/**
 * 404 Not Found handler
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
    const message = `Route ${req.method} ${req.originalUrl} not found`;
    logger.warn(message);
    return errorResponse(res, message, 404);
};

module.exports = {
    errorHandler,
    notFoundHandler
};
