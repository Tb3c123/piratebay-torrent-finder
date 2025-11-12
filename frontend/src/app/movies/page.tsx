'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMovieSearch, MovieSearchBar, MovieGrid } from '@/features/movies'

export default function MoviesPage() {
    const router = useRouter()
    const {
        movies,
        loading,
        loadingMore,
        error,
        currentPage,
        totalPages,
        totalResults,
        hasMore,
        search,
        loadMore,
    } = useMovieSearch()

    useEffect(() => {
        // Load default movies on mount
        search('Marvel')
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-4">🎬 Movie Browser</h1>
                    <p className="text-gray-400">Search for movies and download torrents</p>
                </div>

                {/* Navigation */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        ← Back to Torrent Search
                    </button>
                    <button
                        onClick={() => router.push('/logs')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        📋 System Logs
                    </button>
                </div>

                {/* Search Bar */}
                <MovieSearchBar onSearch={search} loading={loading} />

                {/* Movies Grid */}
                <MovieGrid
                    movies={movies}
                    loading={loading}
                    loadingMore={loadingMore}
                    error={error}
                    onLoadMore={loadMore}
                    hasMore={hasMore}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalResults={totalResults}
                />
            </div>
        </div>
    )
}
