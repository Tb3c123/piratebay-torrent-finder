const express = require('express');
const router = express.Router();
const qbittorrentService = require('../services/qbittorrent');

// Add torrent to qBittorrent
router.post('/add', async (req, res) => {
    try {
        const { magnetLink, savePath } = req.body;

        if (!magnetLink) {
            return res.status(400).json({ error: 'Magnet link is required' });
        }

        await qbittorrentService.login();
        const result = await qbittorrentService.addTorrent(magnetLink, savePath);

        res.json({ success: true, message: 'Torrent added successfully', result });
    } catch (error) {
        console.error('qBittorrent error:', error);
        res.status(500).json({ error: 'Failed to add torrent to qBittorrent' });
    }
});

// Get qBittorrent status
router.get('/status', async (req, res) => {
    try {
        await qbittorrentService.login();
        const torrents = await qbittorrentService.getTorrents();

        res.json({ success: true, torrents });
    } catch (error) {
        console.error('qBittorrent status error:', error);
        res.status(500).json({ error: 'Failed to get qBittorrent status' });
    }
});

// Get all torrents
router.get('/torrents', async (req, res) => {
    try {
        await qbittorrentService.login();
        const torrents = await qbittorrentService.getTorrents();

        res.json({ success: true, torrents });
    } catch (error) {
        console.error('qBittorrent get torrents error:', error);
        res.status(500).json({ error: 'Failed to get torrents' });
    }
});

// Pause a torrent
router.post('/pause/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        await qbittorrentService.login();
        await qbittorrentService.pauseTorrent(hash);

        res.json({ success: true, message: 'Torrent paused' });
    } catch (error) {
        console.error('qBittorrent pause error:', error);
        res.status(500).json({ error: 'Failed to pause torrent' });
    }
});

// Resume a torrent
router.post('/resume/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        await qbittorrentService.login();
        await qbittorrentService.resumeTorrent(hash);

        res.json({ success: true, message: 'Torrent resumed' });
    } catch (error) {
        console.error('qBittorrent resume error:', error);
        res.status(500).json({ error: 'Failed to resume torrent' });
    }
});

// Force start a torrent
router.post('/force-start/:hash', async (req, res) => {
    try {
        const { hash } = req.params;

        await qbittorrentService.login();
        await qbittorrentService.forceStartTorrent(hash);

        res.json({ success: true, message: 'Torrent force started' });
    } catch (error) {
        console.error('qBittorrent force start error:', error);
        res.status(500).json({ error: 'Failed to force start torrent' });
    }
});

// Delete a torrent
router.delete('/delete/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        const { deleteFiles } = req.query;

        await qbittorrentService.login();
        await qbittorrentService.deleteTorrent(hash, deleteFiles === 'true');

        res.json({ success: true, message: 'Torrent deleted' });
    } catch (error) {
        console.error('qBittorrent delete error:', error);
        res.status(500).json({ error: 'Failed to delete torrent' });
    }
});

module.exports = router;
