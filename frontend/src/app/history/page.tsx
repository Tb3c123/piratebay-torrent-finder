'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SearchHistoryItem {
    id?: number
    query: string
    timestamp: number | string
    type?: 'movie' | 'anime'
    category?: string
    resultCount?: number
}

export default function HistoryPage() {
    const router = useRouter()
    const [history, setHistory] = useState<SearchHistoryItem[]>([])
    const [displayedHistory, setDisplayedHistory] = useState<SearchHistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const observerTarget = useRef<HTMLDivElement>(null)

    const ITEMS_PER_PAGE = 20

    useEffect(() => {
        loadFullHistory()
    }, [])

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreItems()
                }
            },
            { threshold: 0.1 }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [hasMore, loadingMore, page])

    const loadFullHistory = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${API_URL}/api/history`)
            const allHistory = response.data
            setHistory(allHistory)

            // Load first page
            const firstPage = allHistory.slice(0, ITEMS_PER_PAGE)
            setDisplayedHistory(firstPage)
            setPage(1)
            setHasMore(allHistory.length > ITEMS_PER_PAGE)
        } catch (error) {
            console.error('Failed to load history:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadMoreItems = useCallback(() => {
        if (loadingMore || !hasMore) return

        setLoadingMore(true)
        setTimeout(() => {
            const nextPage = page + 1
            const startIndex = page * ITEMS_PER_PAGE
            const endIndex = startIndex + ITEMS_PER_PAGE
            const nextItems = history.slice(startIndex, endIndex)

            if (nextItems.length > 0) {
                setDisplayedHistory(prev => [...prev, ...nextItems])
                setPage(nextPage)
                setHasMore(endIndex < history.length)
            } else {
                setHasMore(false)
            }

            setLoadingMore(false)
        }, 300) // Small delay for smooth loading
    }, [page, history, loadingMore, hasMore])

    const handleSearchFromHistory = (item: SearchHistoryItem) => {
        if (item.category === 'piratebay') {
            router.push(`/torrent/search?q=${encodeURIComponent(item.query)}`)
        } else {
            router.push(`/?search=${encodeURIComponent(item.query)}`)
        }
    }

    const clearHistory = async () => {
        if (!confirm('Clear all search history?')) return

        try {
            await axios.delete(`${API_URL}/api/history`)
            setHistory([])
            setDisplayedHistory([])
            setHasMore(false)
        } catch (error) {
            console.error('Failed to clear history:', error)
            alert('Failed to clear history')
        }
    }

    const groupByDate = (items: SearchHistoryItem[]) => {
        const groups: { [key: string]: SearchHistoryItem[] } = {}

        items.forEach(item => {
            const date = new Date(item.timestamp)
            const dateKey = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            if (!groups[dateKey]) {
                groups[dateKey] = []
            }
            groups[dateKey].push(item)
        })

        return groups
    }

    const groupedHistory = groupByDate(displayedHistory)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto pl-20 pr-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        ← Back to Home
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                🔍 Search History
                            </h1>
                            <p className="text-gray-400">
                                {history.length} total searches
                            </p>
                        </div>

                        {history.length > 0 && (
                            <button
                                onClick={clearHistory}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Clear All History
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p className="text-gray-400">Loading history...</p>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-lg mb-4">No search history yet</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Start Searching
                        </button>
                    </div>
                ) : (
                    <>
                        {/* History Items Grouped by Date */}
                        <div className="space-y-6">
                            {Object.entries(groupedHistory).map(([date, items]) => (
                                <div key={date} className="bg-gray-800 rounded-lg p-6">
                                    <h2 className="text-xl font-semibold text-white mb-4">{date}</h2>
                                    <div className="space-y-2">
                                        {items.map((item, index) => (
                                            <button
                                                key={`${date}-${index}`}
                                                onClick={() => handleSearchFromHistory(item)}
                                                className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white text-lg font-medium mb-1">
                                                            {item.query}
                                                        </p>
                                                        <p className="text-gray-400 text-sm">
                                                            {new Date(item.timestamp).toLocaleTimeString()}
                                                            {item.resultCount !== undefined && ` • ${item.resultCount} results`}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {item.category === 'piratebay' ? (
                                                            <span className="text-sm bg-purple-900 text-purple-200 px-3 py-1 rounded-full flex items-center gap-2">
                                                                🏴‍☠️ Pirate Bay
                                                            </span>
                                                        ) : item.type && (
                                                            <span className="text-sm bg-blue-900 text-blue-200 px-3 py-1 rounded-full">
                                                                {item.type === 'movie' ? '🎥 Movie' : '📺 Anime'}
                                                            </span>
                                                        )}
                                                        <span className="text-gray-400 text-xl">→</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Infinite Scroll Trigger */}
                        <div ref={observerTarget} className="py-8 text-center">
                            {loadingMore && (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                                    <p className="text-gray-400">Loading more...</p>
                                </>
                            )}
                            {!hasMore && history.length > ITEMS_PER_PAGE && (
                                <p className="text-gray-500">No more history to load</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
