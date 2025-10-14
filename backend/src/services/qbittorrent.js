const axios = require('axios');

const QBITTORRENT_URL = process.env.QBITTORRENT_URL || 'http://localhost:8080';
const QBITTORRENT_USERNAME = process.env.QBITTORRENT_USERNAME || 'admin';
const QBITTORRENT_PASSWORD = process.env.QBITTORRENT_PASSWORD || 'adminadmin';

let cookie = null;

/**
 * Login to qBittorrent Web UI
 */
async function login() {
    try {
        const response = await axios.post(
            `${QBITTORRENT_URL}/api/v2/auth/login`,
            new URLSearchParams({
                username: QBITTORRENT_USERNAME,
                password: QBITTORRENT_PASSWORD
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        cookie = response.headers['set-cookie'];
        return true;
    } catch (error) {
        console.error('qBittorrent login error:', error.message);
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
        const params = new URLSearchParams({
            urls: magnetLink
        });

        if (savePath) {
            params.append('savepath', savePath);
        }

        const response = await axios.post(
            `${QBITTORRENT_URL}/api/v2/torrents/add`,
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
        const response = await axios.get(
            `${QBITTORRENT_URL}/api/v2/torrents/info`,
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

module.exports = {
    login,
    addTorrent,
    getTorrents
};
