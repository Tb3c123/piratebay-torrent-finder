'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { TorrentSection } from '@/components/torrent'
import { useTorrentSearch, TorrentList } from '@/features/torrents'
import { useAuth } from '@/contexts/AuthContext'

function DirectSearchContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { user } = useAuth()
    const query = searchParams.get('q') || ''

    const {
        torrents,
        loading,
        loadingMore,
        error,
        currentCategory,
        hasMore,
        search,
        loadMore,
        refresh,
    } = useTorrentSearch()

    useEffect(() => {
        if (query) {
            search(query, currentCategory)
        }
    }, [query, currentCategory])

    const handleAlternativeSearch = (customQuery: string) => {
        search(customQuery, currentCategory)
    }

    const handleCategoryChange = (category: string) => {
        if (query) {
            search(query, category)
        }
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

                {/* Torrent Section - Using same component as movie/anime pages */}
                <TorrentSection
                    torrents={torrents}
                    loading={loading}
                    error={error}
                    alternativeTitles={generateAlternativeTitles(query)}
                    onRefresh={refresh}
                    onAlternativeSearch={handleAlternativeSearch}
                    refreshLabel="🔄 Search Again"
                    sectionTitle="🏴‍☠️ Available Torrents"
                />

                {/* Load More & End Messages */}
                <TorrentList
                    torrents={[]}
                    loading={false}
                    loadingMore={loadingMore}
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                />

                {/* No Results Message */}
                {!loading && torrents.length === 0 && !error && query && (
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
