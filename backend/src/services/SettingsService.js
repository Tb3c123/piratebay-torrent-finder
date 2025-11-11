/**
 * Settings Service
 * Handles business logic for application settings management
 */

const axios = require('axios');
const { BadRequestError, ServiceUnavailableError } = require('../utils/errors');

class SettingsService {
  /**
   * Test qBittorrent connection
   * @param {string} url - qBittorrent URL
   * @param {string} username - qBittorrent username
   * @param {string} password - qBittorrent password
   * @returns {Promise<Object>} - Connection test result
   */
  static async testQBittorrentConnection(url, username, password) {
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
        throw new BadRequestError('Login failed');
      }
    } catch (error) {
      console.error('qBittorrent connection test failed:', error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableError('Connection refused. Check if qBittorrent is running and URL is correct.');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        throw new ServiceUnavailableError('Connection timeout. Check URL and network connection.');
      } else if (error.response?.status === 403) {
        throw new BadRequestError('Access forbidden. Check username and password.');
      } else {
        throw new ServiceUnavailableError(error.message || 'Connection failed');
      }
    }
  }

  /**
   * Test Jellyfin connection and get libraries
   * @param {string} url - Jellyfin URL
   * @param {string} apiKey - Jellyfin API key
   * @returns {Promise<Object>} - Connection test result with libraries
   */
  static async testJellyfinConnection(url, apiKey) {
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

      if (systemResponse.status !== 200) {
        throw new BadRequestError('Failed to connect to Jellyfin server');
      }

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
    } catch (error) {
      console.error('Jellyfin connection test failed:', error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new ServiceUnavailableError('Connection refused. Check if Jellyfin is running and URL is correct.');
      } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        throw new ServiceUnavailableError('Connection timeout. Check URL and network connection.');
      } else if (error.response?.status === 401) {
        throw new BadRequestError('Unauthorized. Check your API key.');
      } else if (error.response?.status === 403) {
        throw new BadRequestError('Access forbidden. Check API key permissions.');
      } else {
        throw new ServiceUnavailableError(error.message || 'Connection failed');
      }
    }
  }

  /**
   * Get qBittorrent settings for user
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @returns {Object} - qBittorrent settings
   */
  static getQBittorrentSettings(settingsRepo, userId) {
    const settings = settingsRepo.getOrCreate(userId);
    return settings.qbittorrent || {
      url: process.env.QBITTORRENT_URL || 'http://localhost:8080',
      username: process.env.QBITTORRENT_USERNAME || 'admin',
      password: process.env.QBITTORRENT_PASSWORD || 'adminadmin'
    };
  }

  /**
   * Update qBittorrent settings for user
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @param {Object} qbSettings - qBittorrent settings { url, username, password }
   * @returns {void}
   */
  static updateQBittorrentSettings(settingsRepo, userId, qbSettings) {
    settingsRepo.updateQBittorrent(userId, qbSettings);
    
    if (global.addLog) {
      global.addLog(global.LOG_LEVELS.INFO, `qBittorrent settings updated for user ${userId}`);
    }
  }

  /**
   * Get Jellyfin settings for user
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @returns {Object} - Jellyfin settings
   */
  static getJellyfinSettings(settingsRepo, userId) {
    const settings = settingsRepo.getOrCreate(userId);
    return settings.jellyfin || {
      url: process.env.JELLYFIN_URL || '',
      apiKey: process.env.JELLYFIN_API_KEY || '',
      libraries: []
    };
  }

  /**
   * Update Jellyfin settings for user
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @param {Object} jellyfinData - Jellyfin settings { url, apiKey, libraries }
   * @returns {Object} - Updated settings
   */
  static updateJellyfinSettings(settingsRepo, userId, jellyfinData) {
    settingsRepo.updateJellyfin(userId, jellyfinData);
    
    if (global.addLog) {
      global.addLog(global.LOG_LEVELS.INFO, `Jellyfin settings updated for user ${userId}`);
    }

    return jellyfinData;
  }

  /**
   * Get Jellyfin settings with libraries fetched from API
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @param {string} url - Jellyfin URL (optional, uses saved if not provided)
   * @param {string} apiKey - Jellyfin API key (optional, uses saved if not provided)
   * @param {boolean} saveLibraries - Whether to save fetched libraries
   * @returns {Promise<Object>} - Jellyfin settings with libraries
   */
  static async getJellyfinSettingsWithLibraries(settingsRepo, userId, url = null, apiKey = null, saveLibraries = false) {
    const settings = settingsRepo.findByUserId(userId);
    
    // Use provided values or fall back to saved settings
    const jellyfinUrl = url || settings?.jellyfin?.url;
    const jellyfinApiKey = apiKey || settings?.jellyfin?.apiKey;

    if (!jellyfinUrl || !jellyfinApiKey) {
      throw new BadRequestError('Jellyfin not configured. Please save settings first.');
    }

    const result = await this.testJellyfinConnection(jellyfinUrl, jellyfinApiKey);

    // Save libraries if requested
    if (saveLibraries && result.success && result.libraries) {
      const jellyfinData = {
        url: jellyfinUrl,
        apiKey: jellyfinApiKey,
        libraries: result.libraries
      };
      settingsRepo.updateJellyfin(userId, jellyfinData);
    }

    return result;
  }

  /**
   * Get saved Jellyfin libraries (no API call)
   * @param {Object} settingsRepo - Settings repository
   * @param {number} userId - User ID
   * @returns {Array} - Saved libraries
   */
  static getSavedJellyfinLibraries(settingsRepo, userId) {
    const settings = settingsRepo.findByUserId(userId);
    return settings?.jellyfin?.libraries || [];
  }
}

module.exports = SettingsService;
