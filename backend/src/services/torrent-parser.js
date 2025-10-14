const readTorrent = require('read-torrent');
const axios = require('axios');

/**
 * Get file list from magnet link
 * Note: This requires fetching metadata from DHT/trackers which may take time
 * @param {string} magnetLink - Magnet URI
 * @returns {Promise<Array>} Array of files with name and size
 */
async function getFilesFromMagnet(magnetLink) {
    try {
        const torrentInfo = await new Promise((resolve, reject) => {
            readTorrent(magnetLink, (err, torrent) => {
                if (err) reject(err);
                else resolve(torrent);
            });
        });

        return {
            infoHash: torrentInfo.infoHash,
            name: torrentInfo.name,
            announce: torrentInfo.announce || [],
            files: []
        };
    } catch (error) {
        console.error('Error parsing magnet:', error.message);
        return { files: [], error: error.message };
    }
}/**
 * Get file list from torrent file URL
 * @param {string} torrentUrl - URL to .torrent file
 * @returns {Promise<Array>} Array of files with name and size
 */
async function getFilesFromTorrentFile(torrentUrl) {
    try {
        // Reduced timeout for faster failure detection
        const response = await axios.get(torrentUrl, {
            responseType: 'arraybuffer',
            timeout: 5000, // Reduced from 10s to 5s
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 3 // Limit redirects
        });

        const torrentInfo = await new Promise((resolve, reject) => {
            // Add timeout for parsing as well
            const timeoutId = setTimeout(() => reject(new Error('Parsing timeout')), 3000);

            readTorrent(Buffer.from(response.data), (err, torrent) => {
                clearTimeout(timeoutId);
                if (err) reject(err);
                else resolve(torrent);
            });
        });

        // Extract file list and sort alphabetically
        const files = (torrentInfo.files || [])
            .map(file => ({
                name: file.path,
                size: formatBytes(file.length),
                sizeBytes: file.length
            }))
            .sort((a, b) => {
                // Natural sort: numbers in filenames are compared numerically
                return a.name.localeCompare(b.name, undefined, {
                    numeric: true,
                    sensitivity: 'base'
                });
            });

        return {
            name: torrentInfo.name,
            infoHash: torrentInfo.infoHash,
            files
        };
    } catch (error) {
        console.error('Error fetching torrent file:', error.message);
        return { files: [], error: error.message };
    }
}/**
 * Format bytes to human readable size
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Cache management - torrent-parser doesn't use cache but provides interface for consistency
 */
function clearCache() {
    console.log('✓ torrent-parser has no cache to clear');
}

function getCacheStats() {
    return {
        size: 0,
        note: 'torrent-parser does not use caching'
    };
}

module.exports = {
    getFilesFromMagnet,
    getFilesFromTorrentFile,
    formatBytes,
    clearCache,
    getCacheStats
};
