const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../../utils/helpers');
const { successResponse } = require('../../utils/response');
const { BadRequestError } = require('../../utils/errors');
const logger = require('../../utils/logger');

// Import caches from services/routes
let omdbService, moviesRouter, torrentRouter;

// Lazy load to avoid circular dependencies
function getOmdbService() {
    if (!omdbService) omdbService = require('../../services/omdb');
    return omdbService;
}

function getMoviesRouter() {
    if (!moviesRouter) moviesRouter = require('./movies');
    return moviesRouter;
}

function getTorrentRouter() {
    if (!torrentRouter) torrentRouter = require('./torrent');
    return torrentRouter;
}

/**
 * Clear specific cache or all caches
 * POST /api/v1/system/cache/clear/:type
 * Types: omdb, movies, torrents, sections, all
 */
router.post('/cache/clear/:type',
    asyncHandler(async (req, res) => {
        const { type } = req.params;
        const cleared = [];

        switch (type.toLowerCase()) {
            case 'omdb':
                getOmdbService().clearCache();
                cleared.push('OMDB API cache');
                break;

            case 'movies':
                getOmdbService().clearMovieCache();
                cleared.push('Movie details cache');
                break;

            case 'torrents':
                getTorrentRouter().clearCache();
                cleared.push('Torrent details cache');
                break;

            case 'sections':
                getMoviesRouter().clearSectionCache();
                cleared.push('Movie sections cache');
                break;

            case 'all':
                getOmdbService().clearCache();
                getOmdbService().clearMovieCache();
                getTorrentRouter().clearCache();
                getMoviesRouter().clearSectionCache();
                cleared.push('OMDB API cache', 'Movie details cache', 'Torrent details cache', 'Movie sections cache');
                break;

            default:
                throw new BadRequestError(`Invalid cache type: ${type}. Valid types: omdb, movies, torrents, sections, all`);
        }

        logger.info(`Cache cleared: ${type}`, { cleared });
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Cache cleared: ${type}`, { cleared });
        }

        successResponse(res, { cleared }, 'Cache cleared successfully');
    })
);

/**
 * Get cache statistics
 * GET /api/v1/system/cache/stats
 */
router.get('/cache/stats',
    asyncHandler(async (req, res) => {
        logger.info('Cache stats requested');
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, 'Cache stats requested', {
                source: 'system',
                endpoint: '/cache/stats'
            });
        }

        const omdb = getOmdbService();
        const movies = getMoviesRouter();
        const torrents = getTorrentRouter();

        const stats = {
            omdb: omdb.getCacheStats(),
            movies: omdb.getMovieCacheStats(),
            torrents: torrents.getCacheStats(),
            sections: movies.getSectionCacheStats()
        };

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.SUCCESS, 'Cache stats retrieved', {
                totalCaches: Object.keys(stats).length,
                stats: Object.entries(stats).map(([key, val]) => ({
                    cache: key,
                    size: val.size,
                    ttl: val.ttl
                }))
            });
        }

        successResponse(res, { stats });
    })
);

/**
 * Restart the server
 * POST /api/v1/system/restart
 */
router.post('/restart',
    asyncHandler(async (req, res) => {
        logger.warn('Server restart initiated', {
            requestedBy: req.ip || 'unknown',
            timestamp: new Date().toISOString()
        });

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.WARNING, 'Server restart initiated', {
                source: 'system',
                requestedBy: req.ip || 'unknown',
                timestamp: new Date().toISOString()
            });
        }

        successResponse(res, null, 'Server restart initiated. Please wait 5 seconds.');

        // Restart after sending response
        setTimeout(() => {
            logger.info('Restarting server...');
            process.exit(0); // nodemon will auto-restart
        }, 1000);
    })
);

/**
 * Get server health
 * GET /api/v1/system/health
 */
router.get('/health',
    asyncHandler(async (req, res) => {
        const healthData = {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
        };

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, 'Health check performed', {
                status: healthData.status,
                uptime: `${Math.floor(healthData.uptime / 60)} minutes`,
                memoryUsedMB: Math.round(healthData.memory.heapUsed / 1024 / 1024)
            });
        }

        successResponse(res, healthData);
    })
);

module.exports = router;
