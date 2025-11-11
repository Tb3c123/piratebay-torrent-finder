/**
 * Standardized Response Formatter
 * Ensures consistent API response structure
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {String} message - Optional success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = null, statusCode = 200) => {
    const response = {
        success: true,
        data
    };

    if (message) {
        response.message = message;
    }

    return res.status(statusCode).json(response);
};

/**
 * Created response (for POST requests)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {String} message - Optional success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {*} details - Optional error details
 */
const errorResponse = (res, message, statusCode = 500, details = null) => {
    const response = {
        success: false,
        error: message
    };

    if (details) {
        response.details = details;
    }

    return res.status(statusCode).json(response);
};

/**
 * Validation error response
 * @param {Object} res - Express response object
 * @param {Object} errors - Validation errors object
 * @param {String} message - Error message
 */
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
    return res.status(422).json({
        success: false,
        error: message,
        errors
    });
};

/**
 * Paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items count
 */
const paginatedResponse = (res, data, page, limit, total) => {
    return res.status(200).json({
        success: true,
        data,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
        }
    });
};

module.exports = {
    successResponse,
    createdResponse,
    errorResponse,
    validationErrorResponse,
    paginatedResponse
};
