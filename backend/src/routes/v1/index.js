/**
 * API Version 1 Routes
 * Central aggregator for all v1 API endpoints
 */

const express = require('express');
const router = express.Router();

// Import all v1 route modules
const authRoutes = require('./auth');
const moviesRoutes = require('./movies');
const searchRoutes = require('./search');
const torrentRoutes = require('./torrent');
const qbittorrentRoutes = require('./qbittorrent');
const settingsRoutes = require('./settings');
const historyRoutes = require('./history');
const { router: logsRoutes } = require('./logs'); // Logs exports { router, addLog, LOG_LEVELS }
const systemRoutes = require('./system');

// Mount routes with their respective prefixes
router.use('/auth', authRoutes);
router.use('/movies', moviesRoutes);
router.use('/search', searchRoutes);
router.use('/torrent', torrentRoutes);
router.use('/qbittorrent', qbittorrentRoutes);
router.use('/settings', settingsRoutes);
router.use('/history', historyRoutes);
router.use('/logs', logsRoutes);
router.use('/system', systemRoutes);

// API version info endpoint
router.get('/', (req, res) => {
    res.json({
        version: 'v1',
        status: 'active',
        endpoints: {
            auth: '/api/v1/auth',
            movies: '/api/v1/movies',
            search: '/api/v1/search',
            torrent: '/api/v1/torrent',
            qbittorrent: '/api/v1/qbittorrent',
            settings: '/api/v1/settings',
            history: '/api/v1/history',
            logs: '/api/v1/logs',
            system: '/api/v1/system'
        },
        deprecation: {
            notice: 'Legacy /api/* endpoints are deprecated and will be removed in v2',
            migration: 'Please update your API calls to use /api/v1/* endpoints'
        }
    });
});

module.exports = router;
