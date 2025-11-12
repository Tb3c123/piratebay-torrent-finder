// Torrents Feature - Service Layer
import axios from 'axios'
import type { Torrent, TorrentDetails, TorrentSearchParams, TorrentSearchResult } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const torrentsService = {
    /**
     * Search for torrents on PirateBay
     */
    async searchTorrents(params: TorrentSearchParams): Promise<TorrentSearchResult> {
        try {
            const response = await axios.get(`${API_URL}/api/search`, {
                params: {
                    query: params.query,
                    category: params.category || '0',
                    page: params.page?.toString() || '0'
                }
            })

            const torrents = Array.isArray(response.data) ? response.data : []

            // Pirate Bay typically returns 30 results per page
            const hasMore = torrents.length >= 30

            return { torrents, hasMore }
        } catch (error) {
            console.error('Torrent search error:', error)
            throw error
        }
    },

    /**
     * Get detailed information about a specific torrent
     */
    async getTorrentDetails(id: string): Promise<TorrentDetails> {
        try {
            const response = await axios.get(`${API_URL}/api/torrent/${id}`)
            return response.data
        } catch (error) {
            console.error('Torrent details error:', error)
            throw error
        }
    },

    /**
     * Add torrent to qBittorrent
     */
    async addTorrent(magnetLink: string, savePath: string = '/downloads'): Promise<void> {
        try {
            await axios.post(`${API_URL}/api/qbittorrent/add`, {
                magnetLink,
                savePath
            })
        } catch (error) {
            console.error('Add torrent error:', error)
            throw error
        }
    },

    /**
     * Save search to history
     */
    async saveSearchHistory(query: string, category: string = 'piratebay', userId?: string): Promise<void> {
        try {
            await axios.post(`${API_URL}/api/history`, {
                query,
                category,
                userId
            })
        } catch (error) {
            console.error('Save search history error:', error)
            // Don't throw - history is not critical
        }
    }
}
