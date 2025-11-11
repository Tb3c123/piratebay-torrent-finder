const express = require('express');
const router = express.Router();
const omdbService = require('../../services/omdb');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse } = require('../../utils/response');
const { BadRequestError, NotFoundError } = require('../../utils/errors');
const logger = require('../../utils/logger');

// Cache for movie sections
const sectionCache = new Map();
const SECTION_CACHE_TTL = 60 * 60 * 1000; // 1 hour - longer cache, shuffle on client side

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Create copy to avoid mutation
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Search movies
 * GET /api/v1/movies/search?query=inception&page=1
 */
router.get('/search',
    asyncHandler(async (req, res) => {
        const { query, page = 1 } = req.query;

        if (!query) {
            throw new BadRequestError('Query parameter is required');
        }

        logger.info(`Searching movies: ${query}`, { query, page });
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Searching movies: ${query}`, { query, page });
        }

        const results = await omdbService.searchMovies(query, parseInt(page));
        successResponse(res, results);
    })
);

/**
 * Get popular/trending movies
 * GET /api/v1/movies/trending/popular?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/trending/popular',
    asyncHandler(async (req, res) => {
        const language = req.query.lang || 'en';
        const cacheKey = `popular_${language}`;

        // Check cache first
        const cached = sectionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
            logger.debug(`Cache hit for popular movies (${language})`);
            return successResponse(res, cached.data);
        }

        logger.info(`Getting popular movies (${language})`);
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting popular movies (${language})`);
        }

        const results = await omdbService.getPopularMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        successResponse(res, results);
    })
);

/**
 * Get trending movies
 * GET /api/v1/movies/trending/now?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/trending/now',
    asyncHandler(async (req, res) => {
        const language = req.query.lang || 'en';
        const cacheKey = `trending_${language}`;

        // Check cache first
        const cached = sectionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
            logger.debug(`Cache hit for trending movies (${language})`);
            return successResponse(res, cached.data);
        }

        logger.info(`Getting trending movies (${language})`);
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting trending movies (${language})`);
        }

        const results = await omdbService.getTrendingMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        successResponse(res, results);
    })
);

/**
 * Get latest movies
 * GET /api/v1/movies/latest?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/latest',
    asyncHandler(async (req, res) => {
        const language = req.query.lang || 'en';
        const cacheKey = `latest_${language}`;

        // Check cache first
        const cached = sectionCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
            logger.debug(`Cache hit for latest movies (${language})`);
            return successResponse(res, cached.data);
        }

        logger.info(`Getting latest movies (${language})`);
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting latest movies (${language})`);
        }

        const results = await omdbService.getLatestMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        successResponse(res, results);
    })
);

/**
 * Search movie by title and year
 * GET /api/v1/movies/search-exact?title=Inception&year=2010
 */
router.get('/search-exact/details',
    asyncHandler(async (req, res) => {
        const { title, year } = req.query;

        if (!title) {
            throw new BadRequestError('Title parameter is required');
        }

        logger.info(`Searching exact movie: ${title} (${year})`, { title, year });
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Searching exact movie: ${title} (${year})`, { title, year });
        }

        const result = await omdbService.searchByTitleAndYear(title, year);

        if (result.success) {
            successResponse(res, result);
        } else {
            throw new NotFoundError(result.message || 'Movie not found');
        }
    })
);

/**
 * Get movie details by IMDB ID
 * GET /api/v1/movies/:imdbId
 * NOTE: This route must be LAST because it uses a catch-all parameter
 */
router.get('/:imdbId',
    asyncHandler(async (req, res) => {
        const { imdbId } = req.params;

        if (!imdbId || !imdbId.startsWith('tt')) {
            throw new BadRequestError('Valid IMDB ID is required (e.g., tt1375666)');
        }

        logger.info(`Getting movie details: ${imdbId}`, { imdbId });
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting movie details: ${imdbId}`, { imdbId });
        }

        const result = await omdbService.getMovieDetails(imdbId);

        if (result.success) {
            successResponse(res, result);
        } else {
            throw new NotFoundError(result.message || 'Movie not found');
        }
    })
);

// Export cache management functions
router.clearSectionCache = function () {
    const size = sectionCache.size;
    sectionCache.clear();
    logger.info(`Cleared section cache (${size} entries)`);
};

router.getSectionCacheStats = function () {
    return {
        size: sectionCache.size,
        keys: Array.from(sectionCache.keys()),
        ttl: `${SECTION_CACHE_TTL / 1000 / 60} minutes`
    };
};

module.exports = router;
