/**
 * Torrent Validators
 * Validation logic for torrent routes
 */

const { validateRequired, sanitizeString } = require('./common');
const { ValidationError } = require('../utils/errors');

/**
 * Validate search query
 * @param {Object} query - { query, category, page }
 * @returns {Object} - Validated query
 * @throws {ValidationError} if validation fails
 */
const validateSearchQuery = (query) => {
    // Check required field
    validateRequired(query, ['query']);

    const searchQuery = sanitizeString(query.query);

    if (searchQuery.length < 2) {
        throw new ValidationError('Validation failed', {
            query: 'Search query must be at least 2 characters'
        });
    }

    if (searchQuery.length > 200) {
        throw new ValidationError('Validation failed', {
            query: 'Search query must be at most 200 characters'
        });
    }

    // Validate category if provided
    const validCategories = ['0', 'all', 'movies', 'tv', 'anime', 'music', 'games', 'software'];
    const category = query.category || '0';

    if (!validCategories.includes(category.toLowerCase())) {
        throw new ValidationError('Validation failed', {
            category: `Category must be one of: ${validCategories.join(', ')}`
        });
    }

    // Validate page number
    let page = parseInt(query.page) || 0;
    if (page < 0) {
        page = 0;
    }
    if (page > 100) {
        throw new ValidationError('Validation failed', {
            page: 'Page number must be between 0 and 100'
        });
    }

    return {
        query: searchQuery,
        category: category.toLowerCase(),
        page
    };
};

/**
 * Validate magnet link
 * @param {String} magnetLink
 * @throws {ValidationError} if validation fails
 */
const validateMagnetLink = (magnetLink) => {
    if (!magnetLink || typeof magnetLink !== 'string') {
        throw new ValidationError('Validation failed', {
            magnetLink: 'Magnet link is required'
        });
    }

    if (!magnetLink.startsWith('magnet:?')) {
        throw new ValidationError('Validation failed', {
            magnetLink: 'Invalid magnet link format'
        });
    }

    if (magnetLink.length > 2000) {
        throw new ValidationError('Validation failed', {
            magnetLink: 'Magnet link is too long'
        });
    }
};

/**
 * Validate torrent download request
 * @param {Object} data - { magnetLink, savePath, userId }
 * @returns {Object} - Validated data
 * @throws {ValidationError} if validation fails
 */
const validateTorrentDownload = (data) => {
    validateRequired(data, ['magnetLink', 'userId']);
    validateMagnetLink(data.magnetLink);

    return {
        magnetLink: data.magnetLink,
        savePath: data.savePath || null,
        userId: data.userId
    };
};

/**
 * Validate IMDB ID
 * @param {String} imdbId
 * @throws {ValidationError} if validation fails
 */
const validateImdbId = (imdbId) => {
    if (!imdbId || typeof imdbId !== 'string') {
        throw new ValidationError('Validation failed', {
            imdbId: 'IMDB ID is required'
        });
    }

    // IMDB ID format: tt1234567 (2-9 digits)
    if (!/^tt\d{2,9}$/.test(imdbId)) {
        throw new ValidationError('Validation failed', {
            imdbId: 'Invalid IMDB ID format (expected: tt1234567)'
        });
    }
};

module.exports = {
    validateSearchQuery,
    validateMagnetLink,
    validateTorrentDownload,
    validateImdbId
};
