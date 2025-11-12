// Torrents Feature - Torrent Search Hook
import { useState } from 'react'
import { torrentsService } from '../services/torrentsService'
import type { Torrent } from '../types'

export function useTorrentSearch() {
    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState('')
    const [currentQuery, setCurrentQuery] = useState('')
    const [currentCategory, setCurrentCategory] = useState('0')
    const [currentPage, setCurrentPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const search = async (query: string, category: string = '0', append: boolean = false) => {
        if (!query.trim()) return

        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
            setTorrents([])
            setCurrentPage(0)
            setCurrentQuery(query)
            setCurrentCategory(category)
        }

        setError('')

        try {
            const page = append ? currentPage + 1 : 0
            const result = await torrentsService.searchTorrents({ query, category, page })

            if (append) {
                setTorrents(prev => [...prev, ...result.torrents])
                setCurrentPage(page)
            } else {
                setTorrents(result.torrents)
                setCurrentPage(0)
            }

            setHasMore(result.hasMore)

            if (result.torrents.length === 0 && !append) {
                setError('No torrents found. Try a different search term or category.')
            }

            // Save to search history (only on first search, not on load more)
            if (!append) {
                await torrentsService.saveSearchHistory(query, 'piratebay')
            }
        } catch (err: any) {
            console.error('Search error:', err)
            setError(err.response?.data?.error || 'Failed to search torrents')
            if (!append) {
                setTorrents([])
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = () => {
        if (!loadingMore && hasMore && currentQuery) {
            search(currentQuery, currentCategory, true)
        }
    }

    const refresh = () => {
        if (currentQuery) {
            search(currentQuery, currentCategory, false)
        }
    }

    const clear = () => {
        setTorrents([])
        setLoading(false)
        setLoadingMore(false)
        setError('')
        setCurrentQuery('')
        setCurrentCategory('0')
        setCurrentPage(0)
        setHasMore(true)
    }

    return {
        torrents,
        loading,
        loadingMore,
        error,
        currentQuery,
        currentCategory,
        currentPage,
        hasMore,
        search,
        loadMore,
        refresh,
        clear,
    }
}
