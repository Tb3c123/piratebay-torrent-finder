// Settings Feature - API Service
import axios from 'axios'
import type {
    QBittorrentSettings,
    JellyfinSettings,
    SettingsTestResult,
    JellyfinTestResult,
} from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Settings Service - All settings-related API calls
 */
export const settingsService = {
    // ============ qBittorrent Settings ============

    /**
     * Load qBittorrent settings
     */
    loadQBittorrent: async (userId?: number): Promise<QBittorrentSettings | null> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/settings/qbittorrent`, {
                params: { userId },
            })
            // Backend returns: { success: true, data: { url, username, password } }
            return response.data.data || null
        } catch (error) {
            console.error('Failed to load qBittorrent settings:', error)
            return null
        }
    },

    /**
     * Save qBittorrent settings
     */
    saveQBittorrent: async (
        settings: QBittorrentSettings,
        userId?: number
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await axios.post(`${API_URL}/api/v1/settings/qbittorrent`, {
                ...settings,
                userId,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Failed to save qBittorrent settings:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to save settings',
            }
        }
    },

    /**
     * Test qBittorrent connection
     */
    testQBittorrent: async (
        settings: QBittorrentSettings
    ): Promise<SettingsTestResult> => {
        try {
            const response = await axios.post(
                `${API_URL}/api/v1/settings/qbittorrent/test`,
                settings
            )
            // Backend returns: { success: true, data: {...}, message: "..." }
            return {
                success: true,
                message: response.data.message || response.data.data?.message || 'Connection successful!',
            }
        } catch (error: any) {
            console.error('qBittorrent connection test failed:', error)
            return {
                success: false,
                message: error.response?.data?.error || 'Connection failed',
            }
        }
    },

    // ============ Jellyfin Settings ============

    /**
     * Load Jellyfin settings
     */
    loadJellyfin: async (userId?: number): Promise<JellyfinSettings | null> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/settings/jellyfin`, {
                params: { userId },
            })
            // Backend returns: { success: true, data: { url, apiKey, libraries } }
            return response.data.data || null
        } catch (error) {
            console.error('Failed to load Jellyfin settings:', error)
            return null
        }
    },

    /**
     * Save Jellyfin settings and libraries
     */
    saveJellyfin: async (
        settings: JellyfinSettings,
        userId?: number,
        saveLibraries: boolean = true
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            await axios.post(`${API_URL}/api/v1/settings/jellyfin`, {
                ...settings,
                userId,
                saveLibraries,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Failed to save Jellyfin settings:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to save Jellyfin settings',
            }
        }
    },

    /**
     * Test Jellyfin connection and retrieve server info + libraries
     */
    testJellyfin: async (
        settings: JellyfinSettings
    ): Promise<JellyfinTestResult> => {
        try {
            const response = await axios.post(
                `${API_URL}/api/v1/settings/jellyfin/test`,
                settings
            )
            // Backend may return data nested in response.data.data
            const data = response.data.data || response.data
            return {
                success: true,
                message: response.data.message || data.message || 'Connection successful!',
                serverName: data.serverName,
                version: data.version,
                libraries: data.libraries,
            }
        } catch (error: any) {
            console.error('Jellyfin connection test failed:', error)
            return {
                success: false,
                message: error.response?.data?.error || 'Connection failed',
            }
        }
    },
}
