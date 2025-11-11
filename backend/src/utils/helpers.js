/**
 * Common Helper Functions
 * Reusable utility functions across the application
 */

/**
 * Async handler wrapper - catches errors and passes to next middleware
 * @param {Function} fn - Async function to wrap
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Check if string is valid JSON
 * @param {String} str - String to check
 * @returns {Boolean}
 */
const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Sanitize object - remove null/undefined values
 * @param {Object} obj - Object to sanitize
 * @returns {Object}
 */
const sanitizeObject = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

/**
 * Sleep utility
 * @param {Number} ms - Milliseconds to sleep
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Generate random string
 * @param {Number} length - String length
 * @returns {String}
 */
const generateRandomString = (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Parse boolean from string
 * @param {*} value - Value to parse
 * @returns {Boolean}
 */
const parseBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        return value.toLowerCase() === 'true';
    }
    return Boolean(value);
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object}
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {Boolean}
 */
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Format bytes to human readable string
 * @param {Number} bytes - Bytes to format
 * @param {Number} decimals - Decimal places
 * @returns {String}
 */
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

module.exports = {
    asyncHandler,
    isValidJSON,
    sanitizeObject,
    sleep,
    generateRandomString,
    parseBoolean,
    deepClone,
    isEmptyObject,
    formatBytes
};
