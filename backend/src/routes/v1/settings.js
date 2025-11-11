const express = require('express');
const router = express.Router();
const SettingsService = require('../../services/SettingsService');
const { asyncHandler } = require('../../utils/helpers');
const { successResponse } = require('../../utils/response');
const { BadRequestError } = require('../../utils/errors');
const { validateBody } = require('../../middleware/validator');
const { settings: settingsValidators } = require('../../validators');

/**
 * Validate and parse userId from request
 */
function validateUserId(userId) {
  if (!userId) {
    throw new BadRequestError('userId is required');
  }
  const parsed = parseInt(userId);
  if (isNaN(parsed)) {
    throw new BadRequestError('userId must be a valid number');
  }
  return parsed;
}

// Get qBittorrent settings (per user)
router.get('/qbittorrent',
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.query.userId);
        const settings = SettingsService.getQBittorrentSettings(req.repos.settings, userId);
        successResponse(res, settings);
    })
);

// Save qBittorrent settings (per user)
router.post('/qbittorrent',
    validateBody(settingsValidators.validateQBittorrentSettings),
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.body.userId);
        const { url, username, password } = req.validated;

        SettingsService.updateQBittorrentSettings(
            req.repos.settings,
            userId,
            { url, username, password }
        );

        successResponse(res, null, 'qBittorrent settings saved successfully');
    })
);

// Test qBittorrent connection
router.post('/qbittorrent/test',
    validateBody(settingsValidators.validateQBittorrentSettings),
    asyncHandler(async (req, res) => {
        const { url, username, password } = req.validated;
        const result = await SettingsService.testQBittorrentConnection(url, username, password);
        successResponse(res, null, result.message);
    })
);

// Get Jellyfin settings (per user)
router.get('/jellyfin',
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.query.userId);
        const settings = SettingsService.getJellyfinSettings(req.repos.settings, userId);
        successResponse(res, settings);
    })
);

// Save Jellyfin settings (per user)
router.post('/jellyfin',
    validateBody(settingsValidators.validateJellyfinSettings),
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.body.userId);
        const { url, apiKey } = req.validated;
        const { saveLibraries } = req.body;

        let jellyfinData = { url, apiKey, libraries: [] };

        // If saveLibraries flag is true, fetch and save libraries
        if (saveLibraries) {
            const result = await SettingsService.testJellyfinConnection(url, apiKey);
            if (result.success && result.libraries) {
                jellyfinData.libraries = result.libraries;
            }
        }

        SettingsService.updateJellyfinSettings(req.repos.settings, userId, jellyfinData);

        successResponse(
            res,
            { libraries: jellyfinData.libraries },
            'Jellyfin settings saved successfully'
        );
    })
);

// Test Jellyfin connection and get libraries
router.post('/jellyfin/test',
    validateBody(settingsValidators.validateJellyfinSettings),
    asyncHandler(async (req, res) => {
        const { url, apiKey } = req.validated;
        const result = await SettingsService.testJellyfinConnection(url, apiKey);

        successResponse(res, {
            serverName: result.serverName,
            version: result.version,
            libraries: result.libraries
        }, result.message);
    })
);

// Get saved Jellyfin libraries (from settings, no API call, per user)
router.get('/jellyfin/saved-libraries',
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.query.userId);
        const libraries = SettingsService.getSavedJellyfinLibraries(req.repos.settings, userId);
        successResponse(res, libraries);
    })
);

// Get Jellyfin libraries (DEPRECATED - use /jellyfin/test instead)
// This endpoint requires saved settings which might not reflect current test values
router.get('/jellyfin/libraries',
    asyncHandler(async (req, res) => {
        const userId = validateUserId(req.query.userId);
        const result = await SettingsService.getJellyfinSettingsWithLibraries(
            req.repos.settings,
            userId,
            null, // use saved URL
            null, // use saved API key
            false // don't save libraries
        );

        successResponse(res, { libraries: result.libraries });
    })
);

module.exports = router;
