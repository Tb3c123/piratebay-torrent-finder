const express = require('express');
const router = express.Router();
const { searchPirateBay } = require('../../services/piratebay');

// Search for torrents
router.get('/', async (req, res) => {
    try {
        const { query, category = '200', page = '0' } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        global.addLog(global.LOG_LEVELS.INFO, `Search request: ${query}`, { category, page });

        const results = await searchPirateBay(query, category, page);

        global.addLog(global.LOG_LEVELS.INFO, `Search completed: ${results.length} results`, { query });

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        global.addLog(global.LOG_LEVELS.ERROR, 'Search failed', { error: error.message });
        res.status(500).json({ error: 'Failed to search torrents' });
    }
});

module.exports = router;
