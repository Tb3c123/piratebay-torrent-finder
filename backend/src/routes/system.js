const express = require('express');
const router = express.Router();

// Import caches from services/routes
let omdbService, moviesRouter, torrentRouter, jikanService;

// Lazy load to avoid circular dependencies
function getOmdbService() {
    if (!omdbService) omdbService = require('../services/omdb');
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

function getJikanService() {
    if (!jikanService) jikanService = require('../services/jikan');
    return jikanService;
}

/**
 * Clear specific cache or all caches
 * POST /api/system/cache/clear/:type
 * Types: omdb, movies, torrents, sections, anime, animesearch, all
 */
router.post('/cache/clear/:type', (req, res) => {
    const { type } = req.params;
    let cleared = [];

    try {
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

            case 'anime':
                getJikanService().clearAnimeCache();
                cleared.push('Anime details cache');
                break;

            case 'animesearch':
                getJikanService().clearCache();
                cleared.push('Anime search cache');
                break;

            case 'all':
                getOmdbService().clearCache();
                getOmdbService().clearMovieCache();
                getTorrentRouter().clearCache();
                getMoviesRouter().clearSectionCache();
                getJikanService().clearAnimeCache();
                getJikanService().clearCache();
                cleared.push('OMDB API cache', 'Movie details cache', 'Torrent details cache', 'Movie sections cache', 'Anime details cache', 'Anime search cache');
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: `Invalid cache type: ${type}`,
                    validTypes: ['omdb', 'movies', 'torrents', 'sections', 'anime', 'animesearch', 'all']
                });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Cache cleared: ${type}`, { cleared });
        }

        res.json({
            success: true,
            message: `Cache cleared successfully`,
            cleared
        });
    } catch (error) {
        console.error('Error clearing cache:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Cache clear failed', {
                error: error.message,
                type
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to clear cache',
            message: error.message
        });
    }
});

/**
 * Get cache statistics
 * GET /api/system/cache/stats
 */
router.get('/cache/stats', (req, res) => {
    try {
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, 'Cache stats requested', {
                source: 'system',
                endpoint: '/cache/stats'
            });
        }

        const omdb = getOmdbService();
        const movies = getMoviesRouter();
        const torrents = getTorrentRouter();
        const jikan = getJikanService();

        const stats = {
            omdb: omdb.getCacheStats(),
            movies: omdb.getMovieCacheStats(),
            torrents: torrents.getCacheStats(),
            sections: movies.getSectionCacheStats(),
            anime: jikan.getAnimeCacheStats(),
            animeSearch: jikan.getCacheStats()
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

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error getting cache stats:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Failed to get cache stats', {
                error: error.message,
                stack: error.stack
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get cache statistics',
            message: error.message
        });
    }
});

/**
 * Restart the server
 * POST /api/system/restart
 */
router.post('/restart', (req, res) => {
    if (global.addLog) {
        global.addLog(global.LOG_LEVELS.WARNING, 'Server restart initiated', {
            source: 'system',
            requestedBy: req.ip || 'unknown',
            timestamp: new Date().toISOString()
        });
    }

    res.json({
        success: true,
        message: 'Server restart initiated. Please wait 5 seconds.'
    });

    // Restart after sending response
    setTimeout(() => {
        console.log('🔄 Restarting server...');
        process.exit(0); // nodemon will auto-restart
    }, 1000);
});

/**
 * Get server health
 * GET /api/system/health
 */
router.get('/health', (req, res) => {
    try {
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

        res.json({
            success: true,
            ...healthData
        });
    } catch (error) {
        console.error('Error getting health status:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Health check failed', {
                error: error.message
            });
        }

        res.status(500).json({
            success: false,
            status: 'unhealthy',
            error: error.message
        });
    }
});

module.exports = router;
