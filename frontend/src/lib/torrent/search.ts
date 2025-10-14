// Torrent search service - reusable logic for searching torrents
import axios from 'axios'
import { Torrent, SearchResult } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface TorrentSearchOptions {
    query: string
    category?: string
}

/**
 * Search torrents with a single query
 */
export async function searchTorrents(
    options: TorrentSearchOptions
): Promise<SearchResult> {
    try {
        const response = await axios.get(`${API_URL}/api/search`, {
            params: {
                query: options.query,
                category: options.category || '0'
            }
        })

        return {
            torrents: response.data || [],
            query: options.query,
            success: true
        }
    } catch (error) {
        console.error(`Search failed for "${options.query}":`, error)
        return {
            torrents: [],
            query: options.query,
            success: false
        }
    }
}

/**
 * Search torrents with multiple queries (tries until finding results)
 */
export async function searchTorrentsMulti(
    queries: string[],
    category?: string
): Promise<SearchResult> {
    for (const query of queries) {
        const result = await searchTorrents({ query, category })

        if (result.success && result.torrents.length > 0) {
            console.log(`✅ Found ${result.torrents.length} torrents with query: "${query}"`)
            return result
        }
    }

    // No results found with any query
    return {
        torrents: [],
        query: queries.join(', '),
        success: false
    }
}

/**
 * Download torrent via qBittorrent
 */
export async function downloadTorrent(
    magnetLink: string,
    torrentName: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await axios.post(`${API_URL}/api/qbittorrent/add`, { magnetLink })
        return { success: true }
    } catch (error) {
        console.error('Failed to add torrent:', error)
        return {
            success: false,
            error: 'Failed to add torrent to qBittorrent'
        }
    }
}
