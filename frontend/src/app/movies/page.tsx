'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MovieCard from '@/components/MovieCard'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Movie {
    imdbID: string
    Title: string
    Year: string
    Poster: string
    Type: string
}

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentSearchQuery, setCurrentSearchQuery] = useState('') // Track the actual search being displayed
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const router = useRouter()

    useEffect(() => {
        // Load popular movies on mount
        handleSearch('Marvel', 1, false) // Default search
    }, [])

    const handleSearch = async (query: string = searchQuery, page: number = 1, append: boolean = false) => {
        if (!query.trim()) return

        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }
        setError('')

        try {
            const response = await axios.get(`${API_URL}/api/movies/search`, {
                params: { query, page }
            })

            // Backend returns: { success: true, data: { success: true, movies: [...] } }
            const movieData = response.data.data || response.data
            const movies = movieData.movies || []

            if (response.data.success && movies.length > 0) {
                if (append) {
                    setMovies(prev => [...prev, ...movies])
                } else {
                    setMovies(movies)
                    setCurrentSearchQuery(query)
                }
                setTotalResults(movieData.totalResults || movies.length)
                setCurrentPage(page)
            } else {
                setError(movieData.error || 'No movies found')
                if (!append) {
                    setMovies([])
                }
            }
        } catch (err: any) {
            setError('Failed to search movies. Please try again.')
            console.error(err)
            if (!append) {
                setMovies([])
            }
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        handleSearch(searchQuery, 1, false)
    }

    const handleLoadMore = () => {
        const nextPage = currentPage + 1
        handleSearch(currentSearchQuery, nextPage, true)
    }

    const totalPages = Math.ceil(totalResults / 10) // OMDB returns 10 results per page
    // Show load more if we have exactly 10 results (might have more pages) OR if current page < total pages
    const hasMoreResults = currentPage < totalPages || (movies.length % 10 === 0 && movies.length >= 10)

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
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for movies (e.g., Inception, Avengers, Batman)..."
                            className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading || !searchQuery.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>

                {/* Results Info */}
                {totalResults > 0 && (
                    <div className="mb-4 text-gray-400">
                        Showing {movies.length} of {totalResults} results
                        {currentPage > 1 && ` (Page ${currentPage}/${totalPages})`}
                        {currentPage === 1 && totalPages > 1 && ` (${totalPages} pages available)`}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-gray-400 mt-4">Searching movies...</p>
                    </div>
                )}

                {/* Movies Grid */}
                {!loading && movies.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                        {movies.map((movie) => (
                            <MovieCard key={movie.imdbID} {...movie} />
                        ))}
                    </div>
                )}

                {/* Load More Button */}
                {!loading && !error && movies.length > 0 && hasMoreResults && (
                    <div className="mt-6 mb-8 text-center">
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
                                    Loading more movies...
                                </>
                            ) : (
                                <>
                                    🎬 Load More Movies
                                    {totalPages > 1 ? ` (Page ${currentPage + 1} of ${totalPages})` : ` (Page ${currentPage + 1})`}
                                </>
                            )}
                        </button>
                        <p className="text-gray-500 text-sm mt-3">
                            Showing {movies.length} of {totalResults > 0 ? totalResults : '?'} total results
                        </p>
                    </div>
                )}

                {/* End of Results Message */}
                {!loading && !error && movies.length > 0 && !hasMoreResults && movies.length >= 10 && (
                    <div className="mt-6 mb-8 text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
                        <p className="text-gray-400 text-lg">
                            ✅ All results loaded - Showing all {movies.length} movies
                        </p>
                    </div>
                )}

                {/* No Results */}
                {!loading && movies.length === 0 && !error && searchQuery && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">No movies found. Try a different search.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
