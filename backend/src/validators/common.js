/**
 * Common Validation Utilities
 * Reusable validation functions
 */

const { ValidationError } = require('../utils/errors');

/**
 * Validate required fields
 * @param {Object} data - Data to validate
 * @param {Array} requiredFields - Array of required field names
 * @throws {ValidationError} if validation fails
 */
const validateRequired = (data, requiredFields) => {
    const errors = {};

    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors[field] = `${field} is required`;
        }
    });

    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Required fields missing', errors);
    }
};

/**
 * Validate string length
 * @param {String} value - String to validate
 * @param {String} fieldName - Field name for error message
 * @param {Number} min - Minimum length
 * @param {Number} max - Maximum length
 * @throws {ValidationError} if validation fails
 */
const validateStringLength = (value, fieldName, min = 1, max = 255) => {
    if (typeof value !== 'string') {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be a string`
        });
    }

    if (value.length < min) {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be at least ${min} characters`
        });
    }

    if (value.length > max) {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be at most ${max} characters`
        });
    }
};

/**
 * Validate username format
 * @param {String} username
 * @throws {ValidationError} if validation fails
 */
const validateUsername = (username) => {
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new ValidationError('Validation failed', {
            username: 'Username can only contain letters, numbers, underscores, and hyphens'
        });
    }

    validateStringLength(username, 'username', 3, 30);
};

/**
 * Validate password strength
 * @param {String} password
 * @throws {ValidationError} if validation fails
 */
const validatePassword = (password) => {
    validateStringLength(password, 'password', 6, 100);
};

/**
 * Validate URL format
 * @param {String} url
 * @param {String} fieldName
 * @throws {ValidationError} if validation fails
 */
const validateUrl = (url, fieldName = 'url') => {
    try {
        new URL(url);
    } catch (error) {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be a valid URL`
        });
    }
};

/**
 * Validate email format (optional, for future use)
 * @param {String} email
 * @throws {ValidationError} if validation fails
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError('Validation failed', {
            email: 'Invalid email format'
        });
    }
};

/**
 * Validate number range
 * @param {Number} value
 * @param {String} fieldName
 * @param {Number} min
 * @param {Number} max
 * @throws {ValidationError} if validation fails
 */
const validateNumberRange = (value, fieldName, min, max) => {
    const num = Number(value);
    
    if (isNaN(num)) {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be a number`
        });
    }

    if (num < min || num > max) {
        throw new ValidationError('Validation failed', {
            [fieldName]: `${fieldName} must be between ${min} and ${max}`
        });
    }
};

/**
 * Sanitize string input (remove HTML, trim)
 * @param {String} str
 * @returns {String}
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    // Remove HTML tags and trim
    return str.replace(/<[^>]*>/g, '').trim();
};

module.exports = {
    validateRequired,
    validateStringLength,
    validateUsername,
    validatePassword,
    validateUrl,
    validateEmail,
    validateNumberRange,
    sanitizeString
};
