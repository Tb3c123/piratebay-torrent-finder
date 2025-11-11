/**
 * Authentication Validators
 * Validation logic for auth routes
 */

const {
    validateRequired,
    validateUsername,
    validatePassword,
    sanitizeString
} = require('./common');

/**
 * Validate registration data
 * @param {Object} data - { username, password }
 * @returns {Object} - Sanitized data
 * @throws {ValidationError} if validation fails
 */
const validateRegistration = (data) => {
    // Check required fields
    validateRequired(data, ['username', 'password']);

    // Sanitize inputs
    const username = sanitizeString(data.username);
    const password = data.password; // Don't sanitize password

    // Validate username format
    validateUsername(username);

    // Validate password strength
    validatePassword(password);

    return { username, password };
};

/**
 * Validate login data
 * @param {Object} data - { username, password }
 * @returns {Object} - Sanitized data
 * @throws {ValidationError} if validation fails
 */
const validateLogin = (data) => {
    // Check required fields
    validateRequired(data, ['username', 'password']);

    // Sanitize username
    const username = sanitizeString(data.username);
    const password = data.password;

    return { username, password };
};

module.exports = {
    validateRegistration,
    validateLogin
};
