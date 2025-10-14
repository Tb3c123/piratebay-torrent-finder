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

module.exports = router;
