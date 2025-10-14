'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Movie {
    imdbID: string
    Title: string
    Year: string
    Type: string
    Poster: string
}

interface Anime {
    malId: number
    title: string
    titleEnglish?: string
    type: string
    episodes?: number
    score?: number
    image: string
    year?: number
    genres?: string[]
}

function HomeContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchMode, setSearchMode] = useState<'movie' | 'direct'>('movie') // movie: OMDB search, direct: direct Pirate Bay
    const [searchResults, setSearchResults] = useState<Movie[]>([])
    const [hasSearched, setHasSearched] = useState(false) // Track if user has performed search
    const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
    const [popularMovies, setPopularMovies] = useState<Movie[]>([])
    const [latestMovies, setLatestMovies] = useState<Movie[]>([])
    const [topAnime, setTopAnime] = useState<Anime[]>([])
    const [loading, setLoading] = useState(false)
    const [sectionsLoading, setSectionsLoading] = useState(true)
    const [error, setError] = useState('')

    // Load movie sections on mount
    useEffect(() => {
        loadMovieSections()
    }, [])

    // Reset search state when returning to homepage (no search params)
    useEffect(() => {
        const searchFromUrl = searchParams.get('search')
        if (!searchFromUrl && hasSearched) {
            // Reset search state directly without calling handleClearSearch
            setSearchQuery('')
            setSearchResults([])
            setHasSearched(false)
            setError('')
            setLoading(false)
        }
    }, [searchParams, hasSearched])

    // Handle search from URL params (from search history)
    useEffect(() => {
        const searchFromUrl = searchParams.get('search')
        if (searchFromUrl && searchFromUrl !== searchQuery) {
            setSearchQuery(searchFromUrl)
            // Don't auto-search, let user click Search button
        }
    }, [searchParams])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // F5 or Escape to clear search
            if ((e.key === 'F5' || e.key === 'Escape') && (searchResults.length > 0 || error)) {
                e.preventDefault()
                handleClearSearch()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [searchResults, error])

    // Shuffle array using Fisher-Yates algorithm
    const shuffleArray = <T,>(array: T[]): T[] => {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    const loadMovieSections = async () => {
        setSectionsLoading(true)
        try {
            const [trending, popular, latest, anime] = await Promise.all([
                axios.get(`${API_URL}/api/movies/trending/now`).catch(() => ({ data: { movies: [] } })),
                axios.get(`${API_URL}/api/movies/trending/popular`).catch(() => ({ data: { movies: [] } })),
                axios.get(`${API_URL}/api/movies/latest`).catch(() => ({ data: { movies: [] } })),
                axios.get(`${API_URL}/api/anime/top?filter=airing`).catch(() => ({ data: { anime: [] } }))
            ])

            // Validate and filter out invalid movie data
            const validateMovies = (movies: any[]) => {
                return movies.filter(m =>
                    m &&
                    m.imdbID &&
                    m.Title &&
                    m.Year &&
                    m.Type
                )
            }

            // Shuffle arrays on client side (only shuffles on F5/page load)
            setTrendingMovies(shuffleArray(validateMovies(trending.data.movies || [])))
            setPopularMovies(shuffleArray(validateMovies(popular.data.movies || [])))
            setLatestMovies(shuffleArray(validateMovies(latest.data.movies || [])))
            setTopAnime(shuffleArray(anime.data.anime || []))
        } catch (err) {
            console.error('Error loading sections:', err)
        } finally {
            setSectionsLoading(false)
        }
    }

    const performSearch = async (query: string) => {
        setLoading(true)
        setError('')

        console.log('🔍 Searching with API_URL:', API_URL)
        console.log('🔍 Full URL:', `${API_URL}/api/movies/search?query=${query}`)

        try {
            const response = await axios.get(`${API_URL}/api/movies/search`, {
                params: {
                    query: query,
                    page: 1
                }
            })

            console.log('✅ Response:', response.data)

            if (response.data.movies) {
                setSearchResults(response.data.movies)

                // Save to search history
                try {
                    await axios.post(`${API_URL}/api/history`, {
                        query: query,
                        type: 'movie',
                        resultCount: response.data.movies.length
                    })
                } catch (historyErr) {
                    console.error('Failed to save search history:', historyErr)
                }
            } else {
                setError('No movies found')
                setSearchResults([])
            }
        } catch (err: any) {
            console.error('❌ Error:', err)
            console.error('❌ Response:', err.response?.data)
            setError(err.response?.data?.error || 'Failed to search movies')
            setSearchResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        if (searchMode === 'direct') {
            // Direct Pirate Bay search - redirect to torrent page
            router.push(`/torrent/search?q=${encodeURIComponent(searchQuery)}`)
        } else {
            // Movie search via OMDB
            setHasSearched(true)
            performSearch(searchQuery)
        }
    }

    const handleMovieClick = (imdbId: string) => {
        router.push(`/movie/${imdbId}`)
    }

    const handleClearSearch = () => {
        setSearchQuery('')
        setSearchResults([])
        setHasSearched(false)
        setError('')
        setLoading(false)
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="container mx-auto pl-16 pr-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        🏴‍☠️ Pirate Bay Torrent Finder
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Search movies and download torrents with qBittorrent
                    </p>
                </div>

                {/* Search Mode Toggle */}
                <div className="max-w-3xl mx-auto mb-4">
                    <div className="flex items-center justify-center gap-4 p-1 bg-gray-800 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setSearchMode('movie')}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${searchMode === 'movie'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            🎬 Movie Search
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchMode('direct')}
                            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${searchMode === 'direct'
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            🏴‍☠️ Direct Pirate Bay
                        </button>
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">
                        {searchMode === 'movie'
                            ? 'Search movies/series by title, get info & torrents'
                            : 'Search directly on Pirate Bay for anything'}
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-8">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={
                                searchMode === 'movie'
                                    ? 'Search for movies, series... (e.g., Breaking Bad, The Matrix)'
                                    : 'Search Pirate Bay directly... (e.g., Ubuntu ISO, Blender, Game name)'
                            }
                            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                        >
                            {loading ? '🔍 Searching...' : '🔍 Search'}
                        </button>
                        {(searchResults.length > 0 || error) && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                                title="Clear search and return to home"
                            >
                                🔄 Clear
                            </button>
                        )}
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p className="text-gray-400">Searching...</p>
                    </div>
                )}

                {/* Movie Results Grid - Show only when searching */}
                {!loading && searchResults.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">
                            Search Results: {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {searchResults.map((movie) => (
                                <MovieCard
                                    key={movie.imdbID}
                                    movie={movie}
                                    onClick={() => handleMovieClick(movie.imdbID)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty Search State */}
                {!loading && !error && searchResults.length === 0 && hasSearched && (
                    <div className="text-center py-12 text-gray-400 mb-12">
                        <p className="text-xl mb-2">No results found</p>
                        <p>Try searching for something else</p>
                    </div>
                )}

                {/* Movie Sections - Show when not searching or haven't searched yet */}
                {!hasSearched && (
                    <>
                        {/* Trending Section */}
                        {trendingMovies.length > 0 && (
                            <MovieSection
                                title="🔥 Trending Now"
                                movies={trendingMovies}
                                onMovieClick={handleMovieClick}
                            />
                        )}

                        {/* Popular Section */}
                        {popularMovies.length > 0 && (
                            <MovieSection
                                title="⭐ Popular Movies"
                                movies={popularMovies}
                                onMovieClick={handleMovieClick}
                            />
                        )}

                        {/* Latest Section */}
                        {latestMovies.length > 0 && (
                            <MovieSection
                                title="🆕 What's New"
                                movies={latestMovies}
                                onMovieClick={handleMovieClick}
                            />
                        )}

                        {/* Anime Section */}
                        {topAnime.length > 0 && (
                            <AnimeSection
                                title="🎌 Top Airing Anime"
                                anime={topAnime}
                            />
                        )}

                        {/* Loading State for Sections */}
                        {sectionsLoading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                                <p className="text-gray-400">Loading content...</p>
                            </div>
                        )}

                        {/* Welcome Message */}
                        {!sectionsLoading && trendingMovies.length === 0 && popularMovies.length === 0 && latestMovies.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎬</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Search for Movies</h3>
                                <p className="text-gray-400 mb-6">
                                    Enter a movie title above to find torrents
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button
                                        onClick={() => { setSearchQuery('Inception'); handleSearch({ preventDefault: () => { } } as any) }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                                    >
                                        Try: Inception
                                    </button>
                                    <button
                                        onClick={() => { setSearchQuery('Avengers'); handleSearch({ preventDefault: () => { } } as any) }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                                    >
                                        Try: Avengers
                                    </button>
                                    <button
                                        onClick={() => { setSearchQuery('The Matrix'); handleSearch({ preventDefault: () => { } } as any) }}
                                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
                                    >
                                        Try: The Matrix
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </main>
    )
}

// Movie Section Component
function MovieSection({
    title,
    movies,
    onMovieClick
}: {
    title: string;
    movies: Movie[];
    onMovieClick: (imdbId: string) => void
}) {
    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
            <div className="relative">
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    {movies.map((movie) => (
                        <div key={movie.imdbID} className="flex-shrink-0 w-48">
                            <MovieCard
                                movie={movie}
                                onClick={() => onMovieClick(movie.imdbID)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Movie Card Component
function MovieCard({ movie, onClick }: { movie: Movie; onClick: () => void }) {
    const [imageError, setImageError] = useState(false)
    const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !imageError

    // Different colors for different types
    const getTypeBadgeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'movie':
                return 'bg-blue-900 text-blue-400'
            case 'series':
                return 'bg-green-900 text-green-400'
            case 'episode':
                return 'bg-purple-900 text-purple-400'
            case 'game':
                return 'bg-yellow-900 text-yellow-400'
            default:
                return 'bg-gray-900 text-gray-400'
        }
    }

    // Get icon for type
    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'movie':
                return '🎬'
            case 'series':
                return '📺'
            case 'episode':
                return '📹'
            case 'game':
                return '🎮'
            default:
                return '📄'
        }
    }

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all cursor-pointer transform hover:scale-105"
        >
            <div className="aspect-[2/3] relative bg-gray-900">
                {hasPoster ? (
                    <Image
                        src={movie.Poster}
                        alt={movie.Title}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                        unoptimized={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                    {movie.Title}
                </h3>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{movie.Year}</span>
                    <span className={`uppercase px-2 py-0.5 rounded text-xs ${getTypeBadgeColor(movie.Type)}`}>
                        {getTypeIcon(movie.Type)} {movie.Type}
                    </span>
                </div>
            </div>
        </div>
    )
}

// Anime Section Component
function AnimeSection({
    title,
    anime
}: {
    title: string;
    anime: Anime[];
}) {
    const router = useRouter()

    const handleAnimeClick = (malId: number) => {
        // Navigate to anime detail page
        router.push(`/anime/${malId}`)
    }

    return (
        <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
            <div className="relative">
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                    {anime.map((item) => (
                        <div key={item.malId} className="flex-shrink-0 w-48">
                            <AnimeCard
                                anime={item}
                                onClick={() => handleAnimeClick(item.malId)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Anime Card Component
function AnimeCard({ anime, onClick }: { anime: Anime; onClick: () => void }) {
    const [imageError, setImageError] = useState(false)
    const hasImage = anime.image && !imageError

    // Different colors for different types
    const getTypeBadgeColor = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'tv':
                return 'bg-purple-900 text-purple-400'
            case 'movie':
                return 'bg-blue-900 text-blue-400'
            case 'ova':
                return 'bg-green-900 text-green-400'
            case 'special':
                return 'bg-yellow-900 text-yellow-400'
            case 'ona':
                return 'bg-pink-900 text-pink-400'
            default:
                return 'bg-gray-900 text-gray-400'
        }
    }

    // Get icon for type
    const getTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'tv':
                return '📺'
            case 'movie':
                return '🎬'
            case 'ova':
                return '💿'
            case 'special':
                return '⭐'
            case 'ona':
                return '🌐'
            default:
                return '🎌'
        }
    }

    return (
        <div
            onClick={onClick}
            className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-purple-500 transition-all cursor-pointer transform hover:scale-105"
        >
            <div className="aspect-[2/3] relative bg-gray-900">
                {hasImage ? (
                    <Image
                        src={anime.image}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        onError={() => setImageError(true)}
                        unoptimized={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl">🎌</span>
                    </div>
                )}
            </div>
            <div className="p-3">
                <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                    {anime.titleEnglish || anime.title}
                </h3>
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">{anime.year || 'N/A'}</span>
                    {anime.score && (
                        <span className="text-yellow-400 font-semibold">
                            ⭐ {anime.score.toFixed(1)}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className={`uppercase px-2 py-0.5 rounded text-xs ${getTypeBadgeColor(anime.type)}`}>
                        {getTypeIcon(anime.type)} {anime.type}
                    </span>
                    {anime.episodes && (
                        <span className="text-gray-400">
                            {anime.episodes} ep
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    )
}
