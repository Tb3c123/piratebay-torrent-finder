const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

let cookie = null;

/**
 * Load settings from file
 */
async function loadSettings() {
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        // Fallback to environment variables if file doesn't exist
        return {
            qbittorrent: {
                url: process.env.QBITTORRENT_URL || 'http://localhost:8080',
                username: process.env.QBITTORRENT_USERNAME || 'admin',
                password: process.env.QBITTORRENT_PASSWORD || 'adminadmin'
            }
        };
    }
}

/**
 * Get current qBittorrent settings
 */
async function getSettings() {
    const settings = await loadSettings();
    return settings.qbittorrent;
}

/**
 * Login to qBittorrent Web UI
 */
async function login() {
    try {
        const config = await getSettings();
        console.log('[qBittorrent] Logging in to:', config.url);

        const response = await axios.post(
            `${config.url}/api/v2/auth/login`,
            new URLSearchParams({
                username: config.username,
                password: config.password
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        console.log('[qBittorrent] Login response:', response.data);
        console.log('[qBittorrent] Login status:', response.status);

        // qBittorrent returns "Ok." on success, "Fails." on failure
        if (response.data !== 'Ok.') {
            console.error('[qBittorrent] Login failed - response:', response.data);
            throw new Error('Login failed: Invalid credentials');
        }

        cookie = response.headers['set-cookie'];
        console.log('[qBittorrent] Login successful, cookie set');
        return true;
    } catch (error) {
        console.error('[qBittorrent] Login error:', error.message);
        if (error.response) {
            console.error('[qBittorrent] Error response:', error.response.data);
            console.error('[qBittorrent] Error status:', error.response.status);
        }
        throw new Error('Failed to login to qBittorrent');
    }
}

/**
 * Add a torrent to qBittorrent
 * @param {string} magnetLink - Magnet link
 * @param {string} savePath - Optional save path
 */
async function addTorrent(magnetLink, savePath = null) {
    try {
        const config = await getSettings();

        const params = new URLSearchParams({
            urls: magnetLink
        });

        if (savePath) {
            params.append('savepath', savePath);
        }

        const response = await axios.post(
            `${config.url}/api/v2/torrents/add`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('qBittorrent add torrent error:', error.message);
        throw new Error('Failed to add torrent to qBittorrent');
    }
}

/**
 * Get list of torrents from qBittorrent
 */
async function getTorrents() {
    try {
        const config = await getSettings();

        const response = await axios.get(
            `${config.url}/api/v2/torrents/info`,
            {
                headers: {
                    'Cookie': cookie
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('qBittorrent get torrents error:', error.message);
        throw new Error('Failed to get torrents from qBittorrent');
    }
}

/**
 * Pause/Stop a torrent
 * @param {string} hash - Torrent hash
 */
async function pauseTorrent(hash) {
    try {
        const config = await getSettings();
        console.log('[qBittorrent] Stopping torrent:', hash);

        const response = await axios.post(
            `${config.url}/api/v2/torrents/stop`,
            new URLSearchParams({ hashes: hash }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                },
                validateStatus: () => true // Accept any status code
            }
        );

        console.log('[qBittorrent] Stop response:', response.status, response.data);

        if (response.status !== 200) {
            throw new Error(`Stop failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('[qBittorrent] Stop error:', error.message);
        if (error.response) {
            console.error('[qBittorrent] Stop error response:', error.response.status, error.response.data);
        }
        throw new Error('Failed to stop torrent');
    }
}

/**
 * Resume/Start a torrent
 * @param {string} hash - Torrent hash
 */
async function resumeTorrent(hash) {
    try {
        const config = await getSettings();
        console.log('[qBittorrent] Starting torrent:', hash);

        const response = await axios.post(
            `${config.url}/api/v2/torrents/start`,
            new URLSearchParams({ hashes: hash }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                },
                validateStatus: () => true // Accept any status code
            }
        );

        console.log('[qBittorrent] Start response:', response.status, response.data);

        if (response.status !== 200) {
            throw new Error(`Start failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('[qBittorrent] Start error:', error.message);
        if (error.response) {
            console.error('[qBittorrent] Start error response:', error.response.status, error.response.data);
        }
        throw new Error('Failed to start torrent');
    }
}

/**
 * Force start a torrent (override queue limits)
 * @param {string} hash - Torrent hash
 */
async function forceStartTorrent(hash) {
    try {
        const config = await getSettings();
        console.log('[qBittorrent] Force starting torrent:', hash);

        const response = await axios.post(
            `${config.url}/api/v2/torrents/setForceStart`,
            new URLSearchParams({
                hashes: hash,
                value: 'true'
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                },
                validateStatus: () => true // Accept any status code
            }
        );

        console.log('[qBittorrent] Force start response:', response.status, response.data);

        if (response.status !== 200) {
            throw new Error(`Force start failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('[qBittorrent] Force start error:', error.message);
        if (error.response) {
            console.error('[qBittorrent] Force start error response:', error.response.status, error.response.data);
        }
        throw new Error('Failed to force start torrent');
    }
}

/**
 * Delete a torrent
 * @param {string} hash - Torrent hash
 * @param {boolean} deleteFiles - Delete files from disk
 */
async function deleteTorrent(hash, deleteFiles = false) {
    try {
        const config = await getSettings();
        console.log('[qBittorrent] Deleting torrent:', hash, 'deleteFiles:', deleteFiles);

        const response = await axios.post(
            `${config.url}/api/v2/torrents/delete`,
            new URLSearchParams({
                hashes: hash,
                deleteFiles: deleteFiles.toString()
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': cookie
                },
                validateStatus: () => true // Accept any status code
            }
        );

        console.log('[qBittorrent] Delete response:', response.status, response.data);

        if (response.status !== 200) {
            throw new Error(`Delete failed with status ${response.status}`);
        }

        return true;
    } catch (error) {
        console.error('[qBittorrent] Delete error:', error.message);
        if (error.response) {
            console.error('[qBittorrent] Delete error response:', error.response.status, error.response.data);
        }
        throw new Error('Failed to delete torrent');
    }
}

module.exports = {
    login,
    addTorrent,
    getTorrents,
    pauseTorrent,
    resumeTorrent,
    forceStartTorrent,
    deleteTorrent
};
