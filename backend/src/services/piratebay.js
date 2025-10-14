const axios = require('axios');

const PIRATEBAY_API_URL = process.env.PIRATEBAY_API_URL || 'https://apibay.org';
const PIRATEBAY_URL = process.env.PIRATEBAY_URL || 'https://thepiratebay.org';

/**
 * Search The Pirate Bay for torrents using the official API
 * @param {string} query - Search query
 * @param {string} category - Category ID (200 for Video)
 * @param {string} page - Page number
 * @returns {Promise<Array>} Array of torrent results
 */
async function searchPirateBay(query, category = '200', page = '0') {
    try {
        // The Pirate Bay API endpoint
        const searchUrl = `${PIRATEBAY_API_URL}/q.php?q=${encodeURIComponent(query)}&cat=${category}`;

        console.log('Searching API URL:', searchUrl);

        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            timeout: 15000
        });

        const data = response.data;

        // API returns array of torrent objects
        if (!Array.isArray(data) || data.length === 0) {
            console.log('No results found');
            return [];
        }

        // Filter out invalid results and format
        const results = data
            .filter(item => item.name && item.name !== 'No results returned')
            .map(item => {
                // Convert size from bytes to human readable
                const sizeInGB = (parseInt(item.size) / (1024 * 1024 * 1024)).toFixed(2);
                const size = sizeInGB > 1 ? `${sizeInGB} GiB` : `${(parseInt(item.size) / (1024 * 1024)).toFixed(2)} MiB`;

                // Convert timestamp to date
                const uploadDate = new Date(parseInt(item.added) * 1000);
                const uploaded = uploadDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                // Create magnet link
                const magnetLink = `magnet:?xt=urn:btih:${item.info_hash}&dn=${encodeURIComponent(item.name)}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://tracker.bittor.pw:1337/announce&tr=udp://tracker.opentrackr.org:1337&tr=udp://bt.xxx-tracker.com:2710/announce&tr=udp://public.popcorn-tracker.org:6969/announce&tr=udp://eddie4.nl:6969/announce&tr=udp://tracker.torrent.eu.org:451/announce&tr=udp://p4p.arenabg.com:1337/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce`;

                return {
                    id: item.id,
                    title: item.name,
                    magnetLink,
                    size,
                    uploaded,
                    seeders: parseInt(item.seeders) || 0,
                    leechers: parseInt(item.leechers) || 0,
                    detailsUrl: `${PIRATEBAY_URL}/description.php?id=${item.id}`,
                    category: item.category,
                    imdb: item.imdb || null,
                    infoHash: item.info_hash,
                    username: item.username || 'Anonymous',
                    status: item.status || 'unknown'
                };
            })
            .sort((a, b) => b.seeders - a.seeders); // Sort by seeders descending

        console.log(`Returning ${results.length} results`);
        return results;
    } catch (error) {
        console.error('Error searching PirateBay:', error.message);
        throw new Error('Failed to search The Pirate Bay');
    }
}

module.exports = { searchPirateBay };
