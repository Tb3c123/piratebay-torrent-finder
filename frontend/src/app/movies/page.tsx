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
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const router = useRouter()

    useEffect(() => {
        // Load popular movies on mount
        handleSearch('Marvel') // Default search
    }, [])

    const handleSearch = async (query: string = searchQuery, page: number = 1) => {
        if (!query.trim()) return

        setLoading(true)
        setError('')

        try {
            const response = await axios.get(`${API_URL}/api/movies/search`, {
                params: { query, page }
            })

            if (response.data.success) {
                setMovies(response.data.movies)
                setTotalResults(response.data.totalResults)
                setCurrentPage(page)
            } else {
                setError(response.data.error || 'No movies found')
                setMovies([])
            }
        } catch (err: any) {
            setError('Failed to search movies. Please try again.')
            console.error(err)
            setMovies([])
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPage(1)
        handleSearch(searchQuery, 1)
    }

    const handlePageChange = (newPage: number) => {
        handleSearch(searchQuery, newPage)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const totalPages = Math.ceil(totalResults / 10) // OMDB returns 10 results per page

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
                        Page {currentPage} of {totalPages}
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

                {/* Pagination */}
                {!loading && movies.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>

                        <div className="flex gap-1">
                            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                                let pageNum: number
                                if (totalPages <= 5) {
                                    pageNum = i + 1
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i
                                } else {
                                    pageNum = currentPage - 2 + i
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-4 py-2 rounded transition-colors ${pageNum === currentPage
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
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
