// Movies Feature - MovieGrid Component
'use client'

import { MovieCard } from './MovieCard'
import type { Movie } from '../types'

interface MovieGridProps {
    movies: Movie[]
    loading?: boolean
    loadingMore?: boolean
    error?: string
    emptyMessage?: string
    onLoadMore?: () => void
    hasMore?: boolean
    currentPage?: number
    totalPages?: number
    totalResults?: number
}

export function MovieGrid({
    movies,
    loading = false,
    loadingMore = false,
    error,
    emptyMessage = 'No movies found. Try a different search.',
    onLoadMore,
    hasMore = false,
    currentPage = 1,
    totalPages = 1,
    totalResults = 0,
}: MovieGridProps) {
    // Loading state
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Searching movies...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                {error}
            </div>
        )
    }

    // Empty state
    if (movies.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400 text-lg">{emptyMessage}</p>
            </div>
        )
    }

    // Movies grid
    return (
        <>
            {/* Results info */}
            {totalResults > 0 && (
                <div className="mb-4 text-gray-400">
                    Showing {movies.length} of {totalResults} results
                    {currentPage > 1 && ` (Page ${currentPage}/${totalPages})`}
                    {currentPage === 1 && totalPages > 1 && ` (${totalPages} pages available)`}
                </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                {movies.map((movie) => (
                    <MovieCard key={movie.imdbID} {...movie} />
                ))}
            </div>

            {/* Load More Button */}
            {onLoadMore && hasMore && (
                <div className="mt-6 mb-8 text-center">
                    <button
                        onClick={onLoadMore}
                        disabled={loadingMore}
                        className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg ${loadingMore
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
                            }`}
                    >
                        {loadingMore ? (
                            <>
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Loading more movies...
                            </>
                        ) : (
                            <>
                                🎬 Load More Movies
                                {totalPages > 1
                                    ? ` (Page ${currentPage + 1} of ${totalPages})`
                                    : ` (Page ${currentPage + 1})`}
                            </>
                        )}
                    </button>
                    <p className="text-gray-500 text-sm mt-3">
                        Showing {movies.length} of {totalResults > 0 ? totalResults : '?'} total
                        results
                    </p>
                </div>
            )}

            {/* End of Results Message */}
            {!hasMore && movies.length >= 10 && (
                <div className="mt-6 mb-8 text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-lg">
                        ✅ All results loaded - Showing all {movies.length} movies
                    </p>
                </div>
            )}
        </>
    )
}
