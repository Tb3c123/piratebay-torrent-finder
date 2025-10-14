const express = require('express');
const router = express.Router();
const jikanService = require('../services/jikan');

/**
 * Search anime
 * GET /api/anime/search?query=naruto&page=1
 */
router.get('/search', async (req, res) => {
    try {
        const { query, page = 1 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Searching anime: ${query}`, { query, page });
        }

        const results = await jikanService.searchAnime(query, parseInt(page));

        res.json(results);
    } catch (error) {
        console.error('Error in anime search:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Anime search failed', {
                error: error.message,
                query: req.query.query
            });
        }

        res.status(500).json({
            error: 'Failed to search anime',
            message: error.message
        });
    }
});

/**
 * Get top anime
 * GET /api/anime/top?type=tv&filter=airing
 * Types: tv, movie, ova, special, ona, music
 * Filters: airing, upcoming, bypopularity, favorite
 */
router.get('/top', async (req, res) => {
    try {
        const { type, filter, page = 1 } = req.query;

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting top anime`, { type, filter, page });
        }

        const results = await jikanService.getTopAnime(type, filter, parseInt(page));

        res.json(results);
    } catch (error) {
        console.error('Error getting top anime:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get top anime failed', {
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to get top anime',
            message: error.message
        });
    }
});

/**
 * Get seasonal anime
 * GET /api/anime/season - current season
 * GET /api/anime/season?year=2025&season=winter
 * Seasons: winter, spring, summer, fall
 */
router.get('/season', async (req, res) => {
    try {
        const { year, season } = req.query;

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting seasonal anime`, { year, season });
        }

        const results = await jikanService.getSeasonalAnime(
            year ? parseInt(year) : null,
            season
        );

        res.json(results);
    } catch (error) {
        console.error('Error getting seasonal anime:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get seasonal anime failed', {
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to get seasonal anime',
            message: error.message
        });
    }
});

/**
 * Get anime details by MAL ID
 * GET /api/anime/:malId
 */
router.get('/:malId', async (req, res) => {
    try {
        const { malId } = req.params;

        if (!malId || isNaN(malId)) {
            return res.status(400).json({ error: 'Valid MAL ID is required' });
        }

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Getting anime details: ${malId}`, { malId });
        }

        const result = await jikanService.getAnimeDetails(parseInt(malId));

        if (result.success) {
            res.json(result);
        } else {
            res.status(404).json(result);
        }
    } catch (error) {
        console.error('Error getting anime details:', error);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.ERROR, 'Get anime details failed', {
                error: error.message,
                malId: req.params.malId
            });
        }

        res.status(500).json({
            success: false,
            error: 'Failed to get anime details',
            message: error.message
        });
    }
});

module.exports = router;
