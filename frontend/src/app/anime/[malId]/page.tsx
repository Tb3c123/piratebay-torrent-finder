'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { AnimeDetails, Torrent } from '@/lib/types'
import { generateAnimeQueries, searchAnimeTorrents, searchAnimeCustom } from '@/lib/torrent'
import { TorrentSection } from '@/components/torrent'
import { useSessionCache } from '@/hooks/useSessionCache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function AnimeDetailPage({ params }: { params: { malId: string } }) {
    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [searchingTorrents, setSearchingTorrents] = useState(false)
    const [torrentError, setTorrentError] = useState('')
    const [imageError, setImageError] = useState(false)
    const router = useRouter()

    // Use the custom hook for caching
    const { data: anime, loading, error } = useSessionCache<AnimeDetails>(
        `anime_${params.malId}`,
        async () => {
            const response = await axios.get(`${API_URL}/api/anime/${params.malId}`)
            if (response.data.success) {
                return response.data
            } else {
                throw new Error(response.data.error || 'Anime not found')
            }
        },
        (animeData) => {
            // On cache restore, fetch torrents in background
            handleAutoSearch(animeData)
        }
    )

    const handleAutoSearch = async (animeData: AnimeDetails) => {
        setSearchingTorrents(true)
        setTorrentError('')

        try {
            const result = await searchAnimeTorrents(animeData)
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
        if (anime) {
            handleAutoSearch(anime)
        }
    }

    const handleAlternativeSearch = async (query: string) => {
        setSearchingTorrents(true)
        setTorrentError('')

        try {
            const result = await searchAnimeCustom(query)
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
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-400">Loading anime details...</p>
                </div>
            </div>
        )
    }

    if (error || !anime) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mb-6"
                    >
                        ← Back to Home
                    </button>
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg">
                        {error || 'Anime not found'}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
                    >
                        ← Back to Home
                    </button>
                    <a
                        href={`https://myanimelist.net/anime/${anime.malId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        🔗 View on MyAnimeList
                    </a>
                </div>

                {/* Anime Details */}
                <div className="bg-gray-800 rounded-lg overflow-hidden shadow-2xl mb-8">
                    <div className="md:flex">
                        {/* Poster */}
                        <div className="md:w-1/3 bg-gray-900">
                            {anime.image && !imageError ? (
                                <div className="relative h-[600px]">
                                    <Image
                                        src={anime.image}
                                        alt={anime.title}
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
                                        <span className="text-9xl">🎌</span>
                                        <p className="text-lg mt-4">No Image Available</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="md:w-2/3 p-8">
                            <h1 className="text-4xl font-bold text-white mb-2">
                                {anime.titleEnglish || anime.title}
                            </h1>
                            {anime.titleEnglish && anime.titleEnglish !== anime.title && (
                                <h2 className="text-xl text-gray-400 mb-4">{anime.title}</h2>
                            )}
                            {anime.titleJapanese && (
                                <p className="text-gray-500 mb-4">{anime.titleJapanese}</p>
                            )}

                            <div className="flex flex-wrap gap-4 mb-6 text-gray-400">
                                <span>{anime.year || 'N/A'}</span>
                                <span>•</span>
                                <span className="capitalize">{anime.type}</span>
                                {anime.episodes && (
                                    <>
                                        <span>•</span>
                                        <span>{anime.episodes} episodes</span>
                                    </>
                                )}
                                {anime.duration && (
                                    <>
                                        <span>•</span>
                                        <span>{anime.duration}</span>
                                    </>
                                )}
                                {anime.score && (
                                    <>
                                        <span>•</span>
                                        <span className="text-yellow-400">⭐ {anime.score.toFixed(2)}/10</span>
                                    </>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="bg-purple-900 text-purple-200 px-3 py-1 rounded-full text-sm">
                                    {anime.status}
                                </span>
                                {anime.rating && (
                                    <span className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-sm">
                                        {anime.rating}
                                    </span>
                                )}
                                {anime.source && (
                                    <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-sm">
                                        Source: {anime.source}
                                    </span>
                                )}
                            </div>

                            {anime.genres.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-gray-400 text-sm mb-2">Genres</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {anime.genres.map((genre) => (
                                            <span
                                                key={genre.name}
                                                className="bg-indigo-900 text-indigo-200 px-3 py-1 rounded-full text-sm"
                                            >
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {anime.synopsis && (
                                <div className="mb-6">
                                    <h3 className="text-gray-400 text-sm mb-2">Synopsis</h3>
                                    <p className="text-white leading-relaxed">{anime.synopsis}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {anime.studios.length > 0 && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Studios</h3>
                                        <p className="text-white">{anime.studios.map(s => s.name).join(', ')}</p>
                                    </div>
                                )}
                                {anime.aired && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Aired</h3>
                                        <p className="text-white">{anime.aired.string}</p>
                                    </div>
                                )}
                                {anime.season && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Season</h3>
                                        <p className="text-white capitalize">{anime.season} {anime.year}</p>
                                    </div>
                                )}
                                {anime.rank && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Rank</h3>
                                        <p className="text-white">#{anime.rank}</p>
                                    </div>
                                )}
                                {anime.popularity && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Popularity</h3>
                                        <p className="text-white">#{anime.popularity}</p>
                                    </div>
                                )}
                                {anime.members && (
                                    <div>
                                        <h3 className="text-gray-400 text-sm mb-1">Members</h3>
                                        <p className="text-white">{anime.members.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {anime.themes.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-gray-400 text-sm mb-2">Themes</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {anime.themes.map((theme) => (
                                            <span
                                                key={theme.name}
                                                className="bg-pink-900 text-pink-200 px-2 py-1 rounded text-xs"
                                            >
                                                {theme.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {anime.demographics.length > 0 && (
                                <div>
                                    <h3 className="text-gray-400 text-sm mb-2">Demographics</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {anime.demographics.map((demo) => (
                                            <span
                                                key={demo.name}
                                                className="bg-orange-900 text-orange-200 px-2 py-1 rounded text-xs"
                                            >
                                                {demo.name}
                                            </span>
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
                    alternativeTitles={anime ? generateAnimeQueries(anime).slice(1) : []}
                    onRefresh={handleRefresh}
                    onAlternativeSearch={handleAlternativeSearch}
                    sectionTitle="Available Anime Torrents"
                />
            </div>
        </div>
    )
}
