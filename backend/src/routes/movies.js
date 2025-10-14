const express = require('express');
const router = express.Router();
const omdbService = require('../services/omdb');

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
 * GET /api/movies/search?query=inception&page=1
 */
router.get('/search', async (req, res) => {
    try {
        const { query, page = 1 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Searching movies: ${query}`, { query, page });
        }

        const results = await omdbService.searchMovies(query, parseInt(page));

        res.json(results);
    } catch (error) {
        console.error('Error in movie search:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Movie search failed', {
                error: error.message,
                query: req.query.query
            });
        }

        res.status(500).json({
            error: 'Failed to search movies',
            message: error.message
        });
    }
});

/**
 * Get popular/trending movies
 * GET /api/movies/trending/popular?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/trending/popular', async (req, res) => {
    const language = req.query.lang || 'en';
    const cacheKey = `popular_${language}`;

    // Check cache first
    const cached = sectionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
        console.log(`✓ Cache hit for popular movies (${language})`);
        return res.json(cached.data);
    }

    try {
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting popular movies (${language})`);
        }

        const results = await omdbService.getPopularMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        res.json(results);
    } catch (error) {
        console.error('Error getting popular movies:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get popular movies failed', {
                error: error.message,
                language
            });
        }

        res.status(500).json({
            error: 'Failed to get popular movies',
            message: error.message
        });
    }
});

/**
 * Get trending movies
 * GET /api/movies/trending/now?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/trending/now', async (req, res) => {
    const language = req.query.lang || 'en';
    const cacheKey = `trending_${language}`;

    // Check cache first
    const cached = sectionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
        console.log(`✓ Cache hit for trending movies (${language})`);
        return res.json(cached.data);
    }

    try {
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting trending movies (${language})`);
        }

        const results = await omdbService.getTrendingMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        res.json(results);
    } catch (error) {
        console.error('Error getting trending movies:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get trending movies failed', {
                error: error.message,
                language
            });
        }

        res.status(500).json({
            error: 'Failed to get trending movies',
            message: error.message
        });
    }
});

/**
 * Get latest movies
 * GET /api/movies/latest?lang=en
 * Supported languages: en (default), vi, zh, ko
 */
router.get('/latest', async (req, res) => {
    const language = req.query.lang || 'en';
    const cacheKey = `latest_${language}`;

    // Check cache first
    const cached = sectionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SECTION_CACHE_TTL) {
        console.log(`✓ Cache hit for latest movies (${language})`);
        return res.json(cached.data);
    }

    try {
        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting latest movies (${language})`);
        }

        const results = await omdbService.getLatestMovies(language);

        // Store in cache
        sectionCache.set(cacheKey, {
            data: results,
            timestamp: Date.now()
        });

        res.json(results);
    } catch (error) {
        console.error('Error getting latest movies:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get latest movies failed', {
                error: error.message,
                language
            });
        }

        res.status(500).json({
            error: 'Failed to get latest movies',
            message: error.message
        });
    }
});

/**
 * Search movie by title and year
 * GET /api/movies/search-exact?title=Inception&year=2010
 */
router.get('/search-exact/details', async (req, res) => {
    try {
        const { title, year } = req.query;

        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Searching exact movie: ${title} (${year})`, { title, year });
        }

        const result = await omdbService.searchByTitleAndYear(title, year);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error searching exact movie:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Exact movie search failed', {
                error: error.message,
                title: req.query.title,
                year: req.query.year
            });
        }

        res.status(500).json({
            error: 'Failed to search movie',
            message: error.message
        });
    }
});

/**
 * Get movie details by IMDB ID
 * GET /api/movies/:imdbId
 * NOTE: This route must be LAST because it uses a catch-all parameter
 */
router.get('/:imdbId', async (req, res) => {
    try {
        const { imdbId } = req.params;

        if (!imdbId || !imdbId.startsWith('tt')) {
            return res.status(400).json({ error: 'Valid IMDB ID is required (e.g., tt1375666)' });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting movie details: ${imdbId}`, { imdbId });
        }

        const result = await omdbService.getMovieDetails(imdbId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error getting movie details:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get movie details failed', {
                error: error.message,
                imdbId: req.params.imdbId
            });
        }

        res.status(500).json({
            error: 'Failed to get movie details',
            message: error.message
        });
    }
});

// Export cache management functions
router.clearSectionCache = function () {
    const size = sectionCache.size;
    sectionCache.clear();
    console.log(`✓ Cleared section cache (${size} entries)`);
};

router.getSectionCacheStats = function () {
    return {
        size: sectionCache.size,
        keys: Array.from(sectionCache.keys()),
        ttl: `${SECTION_CACHE_TTL / 1000 / 60} minutes`
    };
};

module.exports = router;
