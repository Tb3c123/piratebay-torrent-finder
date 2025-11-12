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
     * Load qBittorrent settings for a user
     */
    loadQBittorrent: async (userId?: number): Promise<QBittorrentSettings | null> => {
        try {
            const response = await axios.get(`${API_URL}/api/settings/qbittorrent`, {
                params: { userId },
            })
            return response.data.settings || null
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
            await axios.post(`${API_URL}/api/settings/qbittorrent`, {
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
                `${API_URL}/api/settings/qbittorrent/test`,
                settings
            )
            return {
                success: true,
                message: response.data.message || 'Connection successful!',
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
     * Load Jellyfin settings for a user
     */
    loadJellyfin: async (userId?: number): Promise<JellyfinSettings | null> => {
        try {
            const response = await axios.get(`${API_URL}/api/settings/jellyfin`, {
                params: { userId },
            })
            return response.data.settings || null
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
            await axios.post(`${API_URL}/api/settings/jellyfin`, {
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
                `${API_URL}/api/settings/jellyfin/test`,
                settings
            )
            return {
                success: true,
                message: response.data.message || 'Connection successful!',
                serverName: response.data.serverName,
                version: response.data.version,
                libraries: response.data.libraries,
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
