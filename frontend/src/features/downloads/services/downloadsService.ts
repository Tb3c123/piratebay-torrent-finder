// Downloads Feature - API Service
import axios from 'axios'
import type { Torrent, TorrentActionResult } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Downloads Service - All qBittorrent torrent management API calls
 */
export const downloadsService = {
    /**
     * Get all active torrents from qBittorrent
     */
    getTorrents: async (userId?: number): Promise<{ torrents: Torrent[]; error?: string }> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/qbittorrent/torrents`, {
                params: { userId },
            })

            // Backend returns: { success: true, data: { torrents: [...] } }
            if (response.data.success && response.data.data) {
                return { torrents: response.data.data.torrents || [] }
            }

            return { torrents: [], error: 'Failed to load torrents' }
        } catch (error: any) {
            console.error('Failed to load torrents:', error)
            return {
                torrents: [],
                error: error.response?.data?.error || 'Failed to load torrents',
            }
        }
    },

    /**
     * Pause a torrent
     */
    pauseTorrent: async (hash: string, userId?: number): Promise<TorrentActionResult> => {
        try {
            await axios.post(`${API_URL}/api/v1/qbittorrent/pause/${hash}`, {
                userId,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Failed to pause torrent:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to pause torrent',
            }
        }
    },

    /**
     * Resume a torrent
     */
    resumeTorrent: async (hash: string, userId?: number): Promise<TorrentActionResult> => {
        try {
            await axios.post(`${API_URL}/api/v1/qbittorrent/resume/${hash}`, {
                userId,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Failed to resume torrent:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to resume torrent',
            }
        }
    },

    /**
     * Force start a torrent (bypass queue limits)
     */
    forceStartTorrent: async (
        hash: string,
        userId?: number
    ): Promise<TorrentActionResult> => {
        try {
            await axios.post(`${API_URL}/api/v1/qbittorrent/force-start/${hash}`, {
                userId,
            })
            return { success: true }
        } catch (error: any) {
            console.error('Failed to force start torrent:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to force start torrent',
            }
        }
    },

    /**
     * Delete a torrent (with or without files)
     */
    deleteTorrent: async (
        hash: string,
        deleteFiles: boolean,
        userId?: number
    ): Promise<TorrentActionResult> => {
        try {
            await axios.delete(
                `${API_URL}/api/v1/qbittorrent/delete/${hash}?deleteFiles=${deleteFiles}&userId=${userId}`
            )
            return { success: true }
        } catch (error: any) {
            console.error('Failed to delete torrent:', error)
            return {
                success: false,
                error: error.response?.data?.error || 'Failed to delete torrent',
            }
        }
    },
}
