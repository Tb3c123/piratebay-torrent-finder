const express = require('express');
const router = express.Router();
const qbittorrentService = require('../../services/qbittorrent');
const { successResponse, errorResponse } = require('../../utils/response');

// Add torrent to qBittorrent
router.post('/add', async (req, res) => {
    try {
        const { magnetLink, savePath, userId } = req.body;

        if (!magnetLink) {
            return errorResponse(res, 'Magnet link is required', 400);
        }

        await qbittorrentService.login(userId);
        const result = await qbittorrentService.addTorrent(magnetLink, savePath, userId);

        successResponse(res, { result }, 'Torrent added successfully');
    } catch (error) {
        console.error('qBittorrent error:', error);
        errorResponse(res, 'Failed to add torrent to qBittorrent', 500);
    }
});

// Get qBittorrent status
router.get('/status', async (req, res) => {
    try {
        const { userId } = req.query;

        await qbittorrentService.login(userId);
        const torrents = await qbittorrentService.getTorrents(userId);

        successResponse(res, { torrents });
    } catch (error) {
        console.error('qBittorrent status error:', error);
        errorResponse(res, 'Failed to get qBittorrent status', 500);
    }
});

// Get all torrents
router.get('/torrents', async (req, res) => {
    try {
        const { userId } = req.query;

        // Disable caching for real-time torrent data
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        await qbittorrentService.login(userId);
        const torrents = await qbittorrentService.getTorrents(userId);

        successResponse(res, { torrents });
    } catch (error) {
        console.error('qBittorrent get torrents error:', error);
        errorResponse(res, 'Failed to get torrents', 500);
    }
});

// Pause a torrent
router.post('/pause/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { userId } = req.body;

        await qbittorrentService.login(userId);
        await qbittorrentService.pauseTorrent(hash, userId);

        successResponse(res, null, 'Torrent paused');
    } catch (error) {
        console.error('qBittorrent pause error:', error);
        errorResponse(res, 'Failed to pause torrent', 500);
    }
});

// Resume a torrent
router.post('/resume/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { userId } = req.body;

        await qbittorrentService.login(userId);
        await qbittorrentService.resumeTorrent(hash, userId);

        successResponse(res, null, 'Torrent resumed');
    } catch (error) {
        console.error('qBittorrent resume error:', error);
        errorResponse(res, 'Failed to resume torrent', 500);
    }
});

// Force start a torrent
router.post('/force-start/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { userId } = req.body;

        await qbittorrentService.login(userId);
        await qbittorrentService.forceStartTorrent(hash, userId);

        successResponse(res, null, 'Torrent force started');
    } catch (error) {
        console.error('qBittorrent force start error:', error);
        errorResponse(res, 'Failed to force start torrent', 500);
    }
});

// Delete a torrent
router.delete('/delete/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { deleteFiles, userId } = req.query;

        await qbittorrentService.login(userId);
        await qbittorrentService.deleteTorrent(hash, deleteFiles === 'true', userId);

        successResponse(res, null, 'Torrent deleted');
    } catch (error) {
        console.error('qBittorrent delete error:', error);
        errorResponse(res, 'Failed to delete torrent', 500);
    }
});

module.exports = router;
