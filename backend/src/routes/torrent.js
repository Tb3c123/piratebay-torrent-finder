const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { getFilesFromTorrentFile } = require('../services/torrent-parser');

const PIRATEBAY_URL = process.env.PIRATEBAY_URL || 'https://thepiratebay.org';

// Simple in-memory cache for torrent details
const torrentCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Format bytes to human readable
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get detailed torrent information by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Torrent ID is required' });
        }

        // Check cache first
        const cached = torrentCache.get(id);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            console.log(`✓ Cache hit for torrent ${id}`);
            return res.json(cached.data);
        }

        global.addLog(global.LOG_LEVELS.INFO, `Fetching torrent details: ${id}`);

        // Try to get info from API first (with reduced timeout)
        let apiData = null;
        try {
            const apiUrl = `https://apibay.org/t.php?id=${id}`;
            const apiResponse = await axios.get(apiUrl, { timeout: 3000 }); // Reduced from 5s to 3s
            if (apiResponse.data && apiResponse.data.id) {
                apiData = apiResponse.data;
            }
        } catch (err) {
            console.log('API fetch failed, will try HTML:', err.message);
        }

        // Initialize details object
        const details = {
            id,
            title: '',
            description: '',
            info: {},
            files: [],
            comments: []
        };

        // Get basic info from API if available
        if (apiData) {
            details.title = apiData.name || '';
            details.info['Category'] = apiData.category || '';
            details.info['Info Hash'] = apiData.info_hash || '';
            details.info['Added'] = apiData.added ? new Date(parseInt(apiData.added) * 1000).toLocaleString() : '';
            details.info['Size'] = apiData.size ? formatBytes(parseInt(apiData.size)) : '';
            details.info['Uploader'] = apiData.username || 'Anonymous';
            details.info['Seeders'] = apiData.seeders || '0';
            details.info['Leechers'] = apiData.leechers || '0';
            details.info['Status'] = apiData.status || 'unknown';

            // Add number of files
            if (apiData.num_files) {
                details.info['Number of Files'] = apiData.num_files.toString();
            }

            // Try to fetch actual file list from torrent file (in parallel for speed)
            if (apiData.info_hash && apiData.num_files > 0) {
                try {
                    // Try common torrent file URLs - fetch in parallel
                    const torrentUrls = [
                        `https://itorrents.org/torrent/${apiData.info_hash}.torrent`,
                        `https://watercache.nanobytes.org/get/${apiData.info_hash}/${encodeURIComponent(apiData.name)}.torrent`,
                        `${PIRATEBAY_URL}/torrent/${id}`
                    ];

                    console.log(`Fetching torrent files in parallel from ${torrentUrls.length} sources...`);

                    // Race condition - use whichever responds first
                    const fetchPromises = torrentUrls.map(url =>
                        getFilesFromTorrentFile(url)
                            .then(torrentData => {
                                if (torrentData.files && torrentData.files.length > 0) {
                                    console.log(`✓ Success from ${url}: ${torrentData.files.length} files`);
                                    return { url, data: torrentData };
                                }
                                return null;
                            })
                            .catch(err => {
                                console.log(`✗ Failed ${url}: ${err.message}`);
                                return null;
                            })
                    );

                    // Wait for first successful response or all to fail
                    const results = await Promise.all(fetchPromises);
                    const successfulResult = results.find(r => r !== null);

                    if (successfulResult) {
                        details.files = successfulResult.data.files;
                        console.log(`Using files from ${successfulResult.url}`);
                    }
                } catch (err) {
                    console.log('Could not fetch torrent file:', err.message);
                }
            }

            // If still no files, add placeholder message
            if (details.files.length === 0 && apiData.num_files > 0) {
                details.files.push({
                    name: `📋 This torrent contains ${apiData.num_files} files`,
                    size: 'Fetching file list...'
                });
                details.files.push({
                    name: '💡 File list could not be retrieved automatically',
                    size: ''
                });
                details.files.push({
                    name: '   Download the torrent to view complete file list',
                    size: ''
                });
            }

            // API description if available
            if (apiData.descr && apiData.descr.trim()) {
                details.description = apiData.descr.trim();
            }
        }

        // Fetch HTML page for additional info (with reduced timeout)
        try {
            const detailUrl = `${PIRATEBAY_URL}/description.php?id=${id}`;
            const response = await axios.get(detailUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
                timeout: 8000, // Reduced from 15s to 8s
                maxRedirects: 3
            });

            const $ = cheerio.load(response.data);

            // Extract title if not already set
            if (!details.title) {
                details.title = $('#title').text().trim() ||
                    $('div#title').text().trim() ||
                    $('h1').first().text().trim() ||
                    $('title').text().replace(' (download torrent) - TPB', '').trim();
            }

            // Extract description if not already set
            if (!details.description || details.description === 'No description available') {
                let descriptionPre = $('div.nfo pre').text().trim() ||
                    $('.nfo pre').text().trim() ||
                    $('pre.nfo').text().trim() ||
                    $('.nfo').text().trim() ||
                    $('div.nfo').text().trim();

                if (!descriptionPre) {
                    // Try to find any pre tag with substantial content
                    $('pre').each((i, elem) => {
                        const text = $(elem).text().trim();
                        if (text.length > 50 && !descriptionPre) {
                            descriptionPre = text;
                        }
                    });
                }

                if (!descriptionPre) {
                    // Last resort: look for description in divs
                    $('div').each((i, elem) => {
                        const className = $(elem).attr('class') || '';
                        const id = $(elem).attr('id') || '';
                        if ((className.includes('desc') || id.includes('desc') ||
                            className.includes('detail') || id.includes('detail')) && !descriptionPre) {
                            const text = $(elem).text().trim();
                            if (text.length > 50) {
                                descriptionPre = text;
                            }
                        }
                    });
                }

                if (descriptionPre) {
                    details.description = descriptionPre;

                    // Try to extract file list from description
                    const lines = descriptionPre.split('\n');
                    let inFileList = false;

                    lines.forEach(line => {
                        const trimmedLine = line.trim();

                        // Detect start of file list section
                        if (trimmedLine.toLowerCase().includes('all the seasons together') ||
                            trimmedLine.toLowerCase().includes('file list') ||
                            trimmedLine.toLowerCase().includes('files:')) {
                            inFileList = true;
                            return;
                        }

                        // Detect end of file list
                        if (inFileList && (trimmedLine === '' || trimmedLine.startsWith('---') ||
                            trimmedLine.toLowerCase().includes('description') ||
                            trimmedLine.toLowerCase().includes('info:'))) {
                            if (details.files.length > 0) {
                                inFileList = false;
                            }
                            return;
                        }

                        // Parse file entries
                        if (inFileList || (!inFileList && details.files.length === 0)) {
                            // Match patterns like: "filename.mkv    123.45 MiB"
                            const match = trimmedLine.match(/^(.+?)\s+(\d+\.?\d*\s*[KMGT]iB)$/);
                            if (match) {
                                const fileName = match[1].trim();
                                const fileSize = match[2].trim();

                                // Filter out obvious non-files
                                if (!fileName.startsWith('http') &&
                                    !fileName.startsWith('www') &&
                                    fileName.length > 0 &&
                                    fileName.length < 200) {
                                    details.files.push({
                                        name: fileName,
                                        size: fileSize
                                    });
                                    inFileList = true;
                                }
                            }
                        }
                    });
                }
            }

            // Extract info from dt/dd pairs
            $('dl.col1 dt, dl.col2 dt').each((i, elem) => {
                const label = $(elem).text().trim().replace(':', '');
                const value = $(elem).next('dd').text().trim();
                if (label && value && !details.info[label]) {
                    details.info[label] = value;
                }
            });

            // Try to extract from HTML table if no files found yet
            if (details.files.length === 0) {
                $('table.vertTh tr').each((i, elem) => {
                    const fileName = $(elem).find('td:first-child').text().trim();
                    const fileSize = $(elem).find('td:last-child').text().trim();
                    if (fileName && fileSize && i > 0) {
                        details.files.push({ name: fileName, size: fileSize });
                    }
                });
            }

            // Extract comments
            $('div.comment').each((i, elem) => {
                const user = $(elem).find('.user').text().trim();
                const date = $(elem).find('.date').text().trim();
                const text = $(elem).find('.txt').text().trim();
                if (user && text) {
                    details.comments.push({ user, date, text });
                }
            });

        } catch (htmlError) {
            console.log('HTML parsing failed:', htmlError.message);
        }

        // Set fallback description if still empty or too short
        if (!details.description || details.description.length < 20) {
            details.description = `No detailed description available for this torrent.

Title: ${details.title}

To view full description and file list, please visit The Pirate Bay directly:
${PIRATEBAY_URL}/description.php?id=${id}

Note: The Pirate Bay may require JavaScript to display full content, which cannot be scraped by this API.`;
        }

        global.addLog(global.LOG_LEVELS.INFO, `Torrent details fetched: ${details.title}`);

        // Store in cache
        torrentCache.set(id, {
            data: details,
            timestamp: Date.now()
        });

        // Clean old cache entries (keep last 100)
        if (torrentCache.size > 100) {
            const firstKey = torrentCache.keys().next().value;
            torrentCache.delete(firstKey);
        }

        res.json(details);
    } catch (error) {
        console.error('Error fetching torrent details:', error.message);
        global.addLog(global.LOG_LEVELS.ERROR, 'Failed to fetch torrent details', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch torrent details' });
    }
});

// Export cache management functions
router.clearCache = function () {
    const size = torrentCache.size;
    torrentCache.clear();
    console.log(`✓ Cleared torrent cache (${size} entries)`);
};

router.getCacheStats = function () {
    return {
        size: torrentCache.size,
        ttl: `${CACHE_TTL / 1000 / 60} minutes`
    };
};

module.exports = router;
