const express = require('express');
const router = express.Router();
const axios = require('axios');
const { asyncHandler } = require('../utils/helpers');
const { successResponse, errorResponse } = require('../utils/response');
const { validateBody, validateQuery } = require('../middleware/validator');
const { settings: settingsValidators } = require('../validators');

/**
 * Test qBittorrent connection
 */
async function testQBittorrentConnection(url, username, password) {
    try {
        // Try to login
        const response = await axios.post(
            `${url}/api/v2/auth/login`,
            new URLSearchParams({
                username,
                password
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            }
        );

        // Check if login was successful
        if (response.data === 'Ok.' || response.status === 200) {
            const cookie = response.headers['set-cookie'];

            // Try to get API version to verify connection
            try {
                await axios.get(`${url}/api/v2/app/version`, {
                    headers: {
                        'Cookie': cookie
                    },
                    timeout: 5000
                });
            } catch (versionError) {
                // Some qBittorrent instances might block version endpoint
                // but login success is enough
                console.log('Version check failed but login succeeded');
            }

            return { success: true, message: 'Connection successful!' };
        } else {
            return { success: false, message: 'Login failed' };
        }
    } catch (error) {
        console.error('qBittorrent connection test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return { success: false, message: 'Connection refused. Check if qBittorrent is running and URL is correct.' };
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            return { success: false, message: 'Connection timeout. Check URL and network connection.' };
        } else if (error.response?.status === 403) {
            return { success: false, message: 'Access forbidden. Check username and password.' };
        } else {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }
}

/**
 * Test Jellyfin connection and get libraries
 */
async function testJellyfinConnection(url, apiKey) {
    try {
        // Remove trailing slash from URL if present
        const cleanUrl = url.replace(/\/+$/, '');

        // Test connection by getting system info
        const systemResponse = await axios.get(`${cleanUrl}/System/Info`, {
            headers: {
                'X-Emby-Token': apiKey
            },
            timeout: 10000
        });

        if (systemResponse.status === 200) {
            // Get libraries (media folders)
            const librariesResponse = await axios.get(`${cleanUrl}/Library/VirtualFolders`, {
                headers: {
                    'X-Emby-Token': apiKey
                },
                timeout: 10000
            });

            const libraries = librariesResponse.data.map(lib => ({
                id: lib.ItemId,
                name: lib.Name,
                type: lib.CollectionType,
                paths: lib.Locations || []
            }));

            return {
                success: true,
                message: 'Connection successful!',
                serverName: systemResponse.data.ServerName,
                version: systemResponse.data.Version,
                libraries
            };
        } else {
            return { success: false, message: 'Failed to connect to Jellyfin server' };
        }
    } catch (error) {
        console.error('Jellyfin connection test failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            return { success: false, message: 'Connection refused. Check if Jellyfin is running and URL is correct.' };
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            return { success: false, message: 'Connection timeout. Check URL and network connection.' };
        } else if (error.response?.status === 401) {
            return { success: false, message: 'Unauthorized. Check your API key.' };
        } else if (error.response?.status === 403) {
            return { success: false, message: 'Access forbidden. Check API key permissions.' };
        } else {
            return { success: false, message: error.message || 'Connection failed' };
        }
    }
}

// Get qBittorrent settings (per user)
router.get('/qbittorrent',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const settings = req.repos.settings.getOrCreate(parseInt(userId));
        const qbSettings = settings.qbittorrent || {
            url: process.env.QBITTORRENT_URL || 'http://localhost:8080',
            username: process.env.QBITTORRENT_USERNAME || 'admin',
            password: process.env.QBITTORRENT_PASSWORD || 'adminadmin'
        };

        successResponse(res, qbSettings);
    })
);

// Save qBittorrent settings (per user)
router.post('/qbittorrent',
    validateBody(settingsValidators.validateQBittorrentSettings),
    asyncHandler(async (req, res) => {
        const { userId } = req.body;
        const { url, username, password } = req.validated;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const userIdNum = parseInt(userId);
        req.repos.settings.updateQBittorrent(userIdNum, { url, username, password });

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `qBittorrent settings updated for user ${userIdNum}`);
        }

        successResponse(res, null, 'Settings saved successfully');
    })
);

// Test qBittorrent connection
router.post('/qbittorrent/test',
    validateBody(settingsValidators.validateQBittorrentSettings),
    asyncHandler(async (req, res) => {
        const { url, username, password } = req.validated;

        const result = await testQBittorrentConnection(url, username, password);

        if (result.success) {
            successResponse(res, null, result.message);
        } else {
            return res.status(400).json({ error: result.message });
        }
    })
);

// Get Jellyfin settings (per user)
router.get('/jellyfin',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const settings = req.repos.settings.getOrCreate(parseInt(userId));
        const jellyfinSettings = settings.jellyfin || {
            url: process.env.JELLYFIN_URL || '',
            apiKey: process.env.JELLYFIN_API_KEY || '',
            libraries: []
        };

        successResponse(res, jellyfinSettings);
    })
);

// Save Jellyfin settings (per user)
router.post('/jellyfin',
    validateBody(settingsValidators.validateJellyfinSettings),
    asyncHandler(async (req, res) => {
        const { userId, saveLibraries } = req.body;
        const { url, apiKey } = req.validated;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const userIdNum = parseInt(userId);
        let jellyfinData = { url, apiKey, libraries: [] };

        // If saveLibraries flag is true, fetch and save libraries
        if (saveLibraries) {
            const result = await testJellyfinConnection(url, apiKey);
            if (result.success && result.libraries) {
                jellyfinData.libraries = result.libraries;
            }
        }

        req.repos.settings.updateJellyfin(userIdNum, jellyfinData);

        if (global.addLog) {
            global.addLog(global.LOG_LEVELS.INFO, `Jellyfin settings updated for user ${userIdNum}`);
        }

        successResponse(res, { libraries: jellyfinData.libraries }, 'Jellyfin settings saved successfully');
    })
);

// Test Jellyfin connection and get libraries
router.post('/jellyfin/test',
    validateBody(settingsValidators.validateJellyfinSettings),
    asyncHandler(async (req, res) => {
        const { url, apiKey } = req.validated;

        const result = await testJellyfinConnection(url, apiKey);

        if (result.success) {
            successResponse(res, {
                serverName: result.serverName,
                version: result.version,
                libraries: result.libraries
            }, result.message);
        } else {
            return res.status(400).json({ error: result.message });
        }
    })
);

// Get saved Jellyfin libraries (from settings, no API call, per user)
router.get('/jellyfin/saved-libraries',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const settings = req.repos.settings.findByUserId(parseInt(userId));
        const libraries = settings?.jellyfin?.libraries || [];

        successResponse(res, libraries);
    })
);

// Get Jellyfin libraries (DEPRECATED - use /jellyfin/test instead)
// This endpoint requires saved settings which might not reflect current test values
router.get('/jellyfin/libraries',
    asyncHandler(async (req, res) => {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const settings = req.repos.settings.findByUserId(parseInt(userId));

        if (!settings?.jellyfin?.url || !settings?.jellyfin?.apiKey) {
            return res.status(400).json({ error: 'Jellyfin not configured. Please save settings first.' });
        }

        const result = await testJellyfinConnection(settings.jellyfin.url, settings.jellyfin.apiKey);

        if (result.success) {
            successResponse(res, { libraries: result.libraries });
        } else {
            return res.status(400).json({ error: result.message });
        }
    })
);

module.exports = router;
