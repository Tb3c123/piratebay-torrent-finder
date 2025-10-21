/**
 * YouTube API Routes
 * Handle YouTube trailer search requests
 */

const express = require('express');
const router = express.Router();
const { searchTrailer, getTrailerOptions } = require('../services/youtube');

/**
 * GET /api/youtube/trailer
 * Search for a movie/show trailer
 * Query params: title (required), year (optional)
 */
router.get('/trailer', async (req, res) => {
    try {
        const { title, year } = req.query;

        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }

        const trailer = await searchTrailer(title, year);

        if (!trailer) {
            return res.status(404).json({ error: 'No trailer found' });
        }

        res.json({
            success: true,
            trailer
        });
    } catch (error) {
        console.error('Trailer search error:', error);
        res.status(500).json({
            error: 'Failed to search for trailer',
            message: error.message
        });
    }
});

/**
 * GET /api/youtube/trailers
 * Get multiple trailer options for a movie/show
 * Query params: title (required), year (optional)
 */
router.get('/trailers', async (req, res) => {
    try {
        const { title, year } = req.query;

        if (!title) {
            return res.status(400).json({ error: 'Title parameter is required' });
        }

        const trailers = await getTrailerOptions(title, year);

        res.json({
            success: true,
            trailers,
            count: trailers.length
        });
    } catch (error) {
        console.error('Trailers search error:', error);
        res.status(500).json({
            error: 'Failed to search for trailers',
            message: error.message
        });
    }
});

module.exports = router;
