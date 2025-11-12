'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { MovieDetails, Torrent } from '@/lib/types'
import { generateMovieQueries, searchMovieTorrents, searchMovieCustom } from '@/lib/torrent'
import { TorrentSection } from '@/features/torrents'
import { useSessionCache } from '@/hooks/useSessionCache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function MovieDetailPage({ params }: { params: { imdbId: string } }) {
    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [searchingTorrents, setSearchingTorrents] = useState(false)
    const [torrentError, setTorrentError] = useState('')
    const [imageError, setImageError] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const router = useRouter()

    // Use the custom hook for caching
    const { data: movie, loading, error } = useSessionCache<MovieDetails>(
        `movie_${params.imdbId}`,
        async () => {
            const response = await axios.get(`${API_URL}/api/movies/${params.imdbId}`)
            if (response.data.success) {
                return response.data.movie
            } else {
                throw new Error(response.data.error || 'Movie not found')
            }
        }
    )

    // Auto-search torrents when movie data is loaded
    useEffect(() => {
        if (movie && !hasSearched && !searchingTorrents) {
            handleAutoSearch(movie)
        }
    }, [movie])

    const handleAutoSearch = async (movieData: MovieDetails) => {
        setSearchingTorrents(true)
        setTorrentError('')
        setHasSearched(true)

        try {
            const result = await searchMovieTorrents(movieData)
            setTorrents(result.torrents)

            if (result.torrents.length === 0) {
                setTorrentError('No torrents found. Try alternative search options below.')
            }
        } catch (err: any) {
            setTorrentError('Failed to search torrents')
            console.error(err)
        } finally {
            setSearchingTorrents(false)
        }
    }

    const handleRefresh = () => {
        if (movie) {
            handleAutoSearch(movie)
        }
    }

    const handleAlternativeSearch = async (query: string) => {
        setSearchingTorrents(true)
        setTorrentError('')

        try {
            const result = await searchMovieCustom(query)
            setTorrents(result.torrents)

            if (result.torrents.length === 0) {
                setTorrentError(`No torrents found for "${query}"`)
            } else {
                console.log(`✅ Found ${result.torrents.length} torrents with query: "${query}"`)
            }
        } catch (err: any) {
            setTorrentError('Failed to search torrents')
            console.error(err)
        } finally {
            setSearchingTorrents(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-400">Loading movie details...</p>
                </div>
            </div>
        )
    }

    if (error || !movie) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mb-6"
                    >
                        ← Back to Search
                    </button>
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
                        {error || 'Movie not found'}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        ← Back to Search
                    </button>
                </div>

                {/* Movie Details */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl mb-8">
                    <div className="md:flex">
                        {/* Poster */}
                        <div className="md:w-1/3 bg-gray-900">
                            {movie.Poster !== 'N/A' && !imageError ? (
                                <div className="relative h-[600px]">
                                    <Image
                                        src={movie.Poster}
                                        alt={movie.Title}
                                        fill
                                        className="object-cover"
                                        priority
                                        onError={() => setImageError(true)}
                                        unoptimized={true}
                                    />
                                </div>
                            ) : (
                                <div className="h-[600px] flex items-center justify-center bg-gray-800">
                                    <div className="text-center text-gray-500 p-8">
                                        <svg className="w-32 h-32 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                        <p className="text-lg">No Poster Available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="md:w-2/3 p-8">
                            <h1 className="text-4xl font-bold text-white mb-2">{movie.Title}</h1>
                            <div className="flex flex-wrap gap-4 mb-6 text-gray-400">
                                <span>{movie.Year}</span>
                                <span>•</span>
                                <span>{movie.Rated}</span>
                                <span>•</span>
                                <span>{movie.Runtime}</span>
                                <span>•</span>
                                <span className="text-yellow-400">⭐ {movie.imdbRating}/10</span>
                            </div>

                            <div className="mb-6">
                                <div className="flex flex-wrap gap-2">
                                    {movie.Genre && movie.Genre.split(', ').map((genre) => (
                                        <span
                                            key={genre}
                                            className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-gray-400 text-sm mb-2">Plot</h3>
                                <p className="text-white leading-relaxed">{movie.Plot}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-1">Director</h3>
                                    <p className="text-white">{movie.Director}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-1">Actors</h3>
                                    <p className="text-white">{movie.Actors}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-1">Released</h3>
                                    <p className="text-white">{movie.Released}</p>
                                </div>
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-1">Language</h3>
                                    <p className="text-white">{movie.Language}</p>
                                </div>
                            </div>

                            {movie.Awards && movie.Awards !== 'N/A' && (
                                <div className="mb-6">
                                    <h3 className="text-gray-400 text-sm mb-1">Awards</h3>
                                    <p className="text-yellow-400">{movie.Awards}</p>
                                </div>
                            )}

                            {movie.Ratings && movie.Ratings.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-2">Ratings</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {movie.Ratings.map((rating, index) => (
                                            <div key={index} className="bg-gray-700 px-3 py-2 rounded">
                                                <p className="text-gray-400 text-xs">{rating.Source}</p>
                                                <p className="text-white font-semibold">{rating.Value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Torrents Section - Using Reusable Component */}
                <TorrentSection
                    torrents={torrents}
                    loading={searchingTorrents}
                    error={torrentError}
                    alternativeTitles={movie ? generateMovieQueries(movie).slice(1) : []}
                    onRefresh={handleRefresh}
                    onAlternativeSearch={handleAlternativeSearch}
                />
            </div>
        </div>
    )
}
