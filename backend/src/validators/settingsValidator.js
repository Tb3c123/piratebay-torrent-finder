/**
 * Settings Validators
 * Validation logic for settings routes
 */

const { validateRequired, validateUrl } = require('./common');
const { ValidationError } = require('../utils/errors');

/**
 * Validate qBittorrent settings
 * @param {Object} settings - { url, username, password }
 * @returns {Object} - Validated settings
 * @throws {ValidationError} if validation fails
 */
const validateQBittorrentSettings = (settings) => {
    if (!settings || typeof settings !== 'object') {
        throw new ValidationError('Invalid settings format');
    }

    // Check required fields
    validateRequired(settings, ['url', 'username', 'password']);

    // Validate URL format
    validateUrl(settings.url, 'qBittorrent URL');

    // Ensure URL doesn't end with slash
    let url = settings.url.trim();
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    return {
        url,
        username: settings.username.trim(),
        password: settings.password // Don't trim password
    };
};

/**
 * Validate Jellyfin settings
 * @param {Object} settings - { url, apiKey, libraries }
 * @returns {Object} - Validated settings
 * @throws {ValidationError} if validation fails
 */
const validateJellyfinSettings = (settings) => {
    if (!settings || typeof settings !== 'object') {
        throw new ValidationError('Invalid settings format');
    }

    // Check required fields
    validateRequired(settings, ['url', 'apiKey']);

    // Validate URL format
    validateUrl(settings.url, 'Jellyfin URL');

    // Ensure URL doesn't end with slash
    let url = settings.url.trim();
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // Validate libraries if provided
    let libraries = settings.libraries || [];
    if (!Array.isArray(libraries)) {
        throw new ValidationError('Validation failed', {
            libraries: 'Libraries must be an array'
        });
    }

    return {
        url,
        apiKey: settings.apiKey.trim(),
        libraries
    };
};

/**
 * Validate full settings update
 * @param {Object} data - { qbittorrent, jellyfin }
 * @returns {Object} - Validated settings
 * @throws {ValidationError} if validation fails
 */
const validateSettingsUpdate = (data) => {
    const validated = {};

    if (data.qbittorrent) {
        validated.qbittorrent = validateQBittorrentSettings(data.qbittorrent);
    }

    if (data.jellyfin) {
        validated.jellyfin = validateJellyfinSettings(data.jellyfin);
    }

    if (Object.keys(validated).length === 0) {
        throw new ValidationError('No valid settings provided');
    }

    return validated;
};

module.exports = {
    validateQBittorrentSettings,
    validateJellyfinSettings,
    validateSettingsUpdate
};
