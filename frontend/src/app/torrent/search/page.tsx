'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { TorrentSection } from '@/components/torrent'
import { Torrent } from '@/lib/types'
import CategoryFilterComponent from '@/components/CategoryFilter'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function DirectSearchContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''

    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('0') // 0 = All categories
    const [currentPage, setCurrentPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        if (query) {
            setTorrents([])
            setCurrentPage(0)
            setHasMore(true)
            searchPirateBay(query, selectedCategory, 0, false)
        }
    }, [query, selectedCategory])

    const searchPirateBay = async (searchQuery: string, category: string = '0', page: number = 0, append: boolean = false) => {
        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }
        setError('')

        try {
            const response = await axios.get(`${API_URL}/api/search`, {
                params: {
                    query: searchQuery,
                    category: category,
                    page: page.toString()
                }
            })

            // Response is array directly, not wrapped in object
            const results = Array.isArray(response.data) ? response.data : []

            if (append) {
                setTorrents(prev => [...prev, ...results])
            } else {
                setTorrents(results)
            }

            // Check if there are more results
            // Pirate Bay typically returns 30 results per page
            setHasMore(results.length >= 30)

            if (results.length === 0 && !append) {
                setError('No torrents found. Try a different search term or category.')
            }

            // Save to search history (only on first search, not on load more)
            if (!append) {
                try {
                    await axios.post(`${API_URL}/api/history`, {
                        query: searchQuery,
                        category: 'piratebay' // Mark as direct Pirate Bay search
                    })
                } catch (historyErr) {
                    console.error('Failed to save search history:', historyErr)
                }
            }
        } catch (err: any) {
            console.error('Search error:', err)
            setError(err.response?.data?.error || 'Failed to search torrents')
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleLoadMore = () => {
        const nextPage = currentPage + 1
        setCurrentPage(nextPage)
        searchPirateBay(query, selectedCategory, nextPage, true)
    }

    const handleDownload = async (magnetLink: string, name: string) => {
        try {
            await axios.post(`${API_URL}/api/qbittorrent/download`, { magnetLink })
            alert(`✅ Torrent "${name}" added to qBittorrent successfully!`)
        } catch (err: any) {
            console.error('Download error:', err)
            alert(`❌ Failed to add torrent: ${err.response?.data?.error || err.message}`)
        }
    }

    const handleRefresh = () => {
        if (query) {
            setTorrents([])
            setCurrentPage(0)
            setHasMore(true)
            searchPirateBay(query, selectedCategory, 0, false)
        }
    }

    const handleAlternativeSearch = async (customQuery: string) => {
        setTorrents([])
        setCurrentPage(0)
        setHasMore(true)
        setLoading(true)
        setError('')

        try {
            const response = await axios.get(`${API_URL}/api/search`, {
                params: {
                    query: customQuery,
                    category: selectedCategory,
                    page: '0'
                }
            })

            const results = Array.isArray(response.data) ? response.data : []
            setTorrents(results)
            setHasMore(results.length >= 30)

            if (results.length === 0) {
                setError('No torrents found. Try a different search term or category.')
            }
        } catch (err: any) {
            console.error('Search error:', err)
            setError(err.response?.data?.error || 'Failed to search torrents')
        } finally {
            setLoading(false)
        }
    }

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category)
        // Search will auto-trigger via useEffect
    }

    const handleBackToHome = () => {
        router.push('/')
    }

    // Generate alternative search queries based on the original query
    const generateAlternativeTitles = (query: string): string[] => {
        if (!query) return []

        const alternatives: string[] = []

        // Add year variations if query contains a year
        const yearMatch = query.match(/\b(19|20)\d{2}\b/)
        if (yearMatch) {
            const withoutYear = query.replace(yearMatch[0], '').trim()
            alternatives.push(withoutYear)
        }

        // Add quality variations
        const qualities = ['1080p', '720p', '2160p', '4K', 'BluRay', 'WEB-DL', 'HDTV']
        qualities.forEach(quality => {
            if (!query.toLowerCase().includes(quality.toLowerCase())) {
                alternatives.push(`${query} ${quality}`)
            }
        })

        // Limit to 5 alternatives
        return alternatives.slice(0, 5)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto pl-20 pr-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBackToHome}
                        className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        ← Back to Home
                    </button>

                    <h1 className="text-4xl font-bold text-white mb-2">
                        🏴‍☠️ Direct Pirate Bay Search
                    </h1>
                    <p className="text-gray-400">
                        Searching for: <span className="text-white font-semibold">{query}</span>
                    </p>
                </div>

                {/* Category Filter */}
                <CategoryFilterComponent
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />

                {/* Torrent Section - Using same component as movie/anime pages */}
                <TorrentSection
                    torrents={torrents}
                    loading={loading}
                    error={error}
                    alternativeTitles={generateAlternativeTitles(query)}
                    onRefresh={handleRefresh}
                    onAlternativeSearch={handleAlternativeSearch}
                    onDownload={handleDownload}
                    refreshLabel="🔄 Search Again"
                    sectionTitle="🏴‍☠️ Available Torrents"
                />

                {/* Load More Button */}
                {!loading && !error && torrents.length > 0 && hasMore && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg ${loadingMore
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
                                }`}
                        >
                            {loadingMore ? (
                                <>
                                    <span className="inline-block animate-spin mr-2">⏳</span>
                                    Loading more results...
                                </>
                            ) : (
                                <>
                                    📥 Load More Results (Page {currentPage + 2})
                                </>
                            )}
                        </button>
                        <p className="text-gray-500 text-sm mt-3">
                            Currently showing {torrents.length} results
                        </p>
                    </div>
                )}

                {/* End of Results Message */}
                {!loading && !error && torrents.length > 0 && !hasMore && (
                    <div className="mt-6 text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-lg">
                            ✅ End of results - Showing all {torrents.length} torrents
                        </p>
                    </div>
                )}

                {/* No Results Message (when not loading and no error) */}
                {!loading && !error && torrents.length === 0 && query && (
                    <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-lg mb-4">No results found for "{query}"</p>
                        <button
                            onClick={handleBackToHome}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                        >
                            Try Another Search
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function DirectSearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        }>
            <DirectSearchContent />
        </Suspense>
    )
}
