const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

const SETTINGS_FILE = path.join(__dirname, '../data/settings.json');

/**
 * Ensure settings file exists
 */
async function ensureSettingsFile() {
    try {
        await fs.access(SETTINGS_FILE);
    } catch {
        // File doesn't exist, create with defaults
        const defaultSettings = {
            qbittorrent: {
                url: process.env.QBITTORRENT_URL || 'http://localhost:8080',
                username: process.env.QBITTORRENT_USERNAME || 'admin',
                password: process.env.QBITTORRENT_PASSWORD || 'adminadmin'
            },
            jellyfin: {
                url: process.env.JELLYFIN_URL || '',
                apiKey: process.env.JELLYFIN_API_KEY || ''
            }
        };
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    }
}

/**
 * Load settings from file
 */
async function loadSettings() {
    await ensureSettingsFile();
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    return JSON.parse(data);
}

/**
 * Save settings to file
 */
async function saveSettings(settings) {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

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

// Get qBittorrent settings
router.get('/qbittorrent', async (req, res) => {
    try {
        const settings = await loadSettings();

        // Return settings without exposing password in plain text
        res.json({
            success: true,
            settings: {
                url: settings.qbittorrent.url,
                username: settings.qbittorrent.username,
                password: settings.qbittorrent.password // Frontend will handle masking
            }
        });
    } catch (error) {
        console.error('Failed to load settings:', error);
        res.status(500).json({ error: 'Failed to load settings' });
    }
});

// Save qBittorrent settings
router.post('/qbittorrent', async (req, res) => {
    try {
        const { url, username, password } = req.body;

        // Validation
        if (!url || !username || !password) {
            return res.status(400).json({ error: 'URL, username, and password are required' });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return res.status(400).json({ error: 'URL must start with http:// or https://' });
        }

        // Load current settings
        const settings = await loadSettings();

        // Update qBittorrent settings
        settings.qbittorrent = {
            url: url.trim(),
            username: username.trim(),
            password: password
        };

        // Save to file
        await saveSettings(settings);

        // Update environment variables for the qbittorrent service
        process.env.QBITTORRENT_URL = url.trim();
        process.env.QBITTORRENT_USERNAME = username.trim();
        process.env.QBITTORRENT_PASSWORD = password;

        res.json({ success: true, message: 'Settings saved successfully' });
    } catch (error) {
        console.error('Failed to save settings:', error);
        res.status(500).json({ error: 'Failed to save settings' });
    }
});

// Test qBittorrent connection
router.post('/qbittorrent/test', async (req, res) => {
    try {
        const { url, username, password } = req.body;

        // Validation
        if (!url || !username || !password) {
            return res.status(400).json({ error: 'URL, username, and password are required' });
        }

        const result = await testQBittorrentConnection(url.trim(), username.trim(), password);

        if (result.success) {
            res.json({ success: true, message: result.message });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error('Failed to test connection:', error);
        res.status(500).json({ error: 'Failed to test connection' });
    }
});

// Get Jellyfin settings
router.get('/jellyfin', async (req, res) => {
    try {
        const settings = await loadSettings();

        res.json({
            success: true,
            settings: {
                url: settings.jellyfin?.url || '',
                apiKey: settings.jellyfin?.apiKey || '',
                libraries: settings.jellyfin?.libraries || []
            }
        });
    } catch (error) {
        console.error('Failed to load Jellyfin settings:', error);
        res.status(500).json({ error: 'Failed to load Jellyfin settings' });
    }
});

// Save Jellyfin settings
router.post('/jellyfin', async (req, res) => {
    try {
        const { url, apiKey, saveLibraries } = req.body;

        // Validation
        if (!url || !apiKey) {
            return res.status(400).json({ error: 'URL and API key are required' });
        }

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return res.status(400).json({ error: 'URL must start with http:// or https://' });
        }

        // Load current settings
        const settings = await loadSettings();

        // Update Jellyfin settings (remove trailing slash from URL)
        settings.jellyfin = {
            url: url.trim().replace(/\/+$/, ''),
            apiKey: apiKey.trim(),
            libraries: settings.jellyfin?.libraries || []
        };

        // If saveLibraries flag is true, fetch and save libraries
        if (saveLibraries) {
            const result = await testJellyfinConnection(url.trim(), apiKey.trim());
            if (result.success && result.libraries) {
                settings.jellyfin.libraries = result.libraries;
            }
        }

        // Save to file
        await saveSettings(settings);

        res.json({
            success: true,
            message: 'Jellyfin settings saved successfully',
            libraries: settings.jellyfin.libraries
        });
    } catch (error) {
        console.error('Failed to save Jellyfin settings:', error);
        res.status(500).json({ error: 'Failed to save Jellyfin settings' });
    }
});

// Test Jellyfin connection and get libraries
router.post('/jellyfin/test', async (req, res) => {
    try {
        const { url, apiKey } = req.body;

        // Validation
        if (!url || !apiKey) {
            return res.status(400).json({ error: 'URL and API key are required' });
        }

        const result = await testJellyfinConnection(url.trim(), apiKey.trim());

        if (result.success) {
            res.json({
                success: true,
                message: result.message,
                serverName: result.serverName,
                version: result.version,
                libraries: result.libraries
            });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error('Failed to test Jellyfin connection:', error);
        res.status(500).json({ error: 'Failed to test Jellyfin connection' });
    }
});

// Get Jellyfin libraries (requires saved settings)
router.get('/jellyfin/libraries', async (req, res) => {
    try {
        const settings = await loadSettings();

        if (!settings.jellyfin?.url || !settings.jellyfin?.apiKey) {
            return res.status(400).json({ error: 'Jellyfin not configured. Please save settings first.' });
        }

        const result = await testJellyfinConnection(settings.jellyfin.url, settings.jellyfin.apiKey);

        if (result.success) {
            res.json({
                success: true,
                libraries: result.libraries
            });
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error) {
        console.error('Failed to get Jellyfin libraries:', error);
        res.status(500).json({ error: 'Failed to get Jellyfin libraries' });
    }
});

// Get saved Jellyfin libraries (from settings, no API call)
router.get('/jellyfin/saved-libraries', async (req, res) => {
    try {
        const settings = await loadSettings();

        res.json({
            success: true,
            libraries: settings.jellyfin?.libraries || []
        });
    } catch (error) {
        console.error('Failed to get saved libraries:', error);
        res.status(500).json({ error: 'Failed to get saved libraries' });
    }
});

module.exports = router;
