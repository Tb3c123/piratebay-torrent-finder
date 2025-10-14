'use client'

import Link from 'next/link'

interface Torrent {
    id: string
    title: string
    magnetLink: string
    size: string
    uploaded: string
    seeders: number
    leechers: number
    detailsUrl: string | null
    category?: string
    username?: string
    status?: string
    infoHash?: string
    imdb?: string | null
}

interface TorrentResultsProps {
    results: Torrent[]
    onDownload: (magnetLink: string) => void
    loading: boolean
}

export default function TorrentResults({ results, onDownload, loading }: TorrentResultsProps) {
    if (loading) {
        return (
            <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                <p className="mt-4 text-gray-400">Searching torrents...</p>
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="mt-8 text-center text-gray-400">
                <p>No results yet. Start searching!</p>
            </div>
        )
    }

    return (
        <div className="mt-8">
            <div className="space-y-4">
                {results.map((torrent, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {torrent.title}
                                </h3>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">
                                        📦 {torrent.size}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        📅 {torrent.uploaded}
                                    </span>
                                    <span className="flex items-center gap-1 text-green-400">
                                        ⬆️ {torrent.seeders} seeders
                                    </span>
                                    <span className="flex items-center gap-1 text-red-400">
                                        ⬇️ {torrent.leechers} leechers
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {/* View Details Link */}
                                <Link
                                    href={`/torrent/${torrent.id || 'unknown'}?${new URLSearchParams({
                                        title: torrent.title,
                                        magnet: torrent.magnetLink,
                                        size: torrent.size,
                                        seeders: torrent.seeders.toString(),
                                        leechers: torrent.leechers.toString(),
                                        uploaded: torrent.uploaded || '',
                                    }).toString()}`}
                                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    View Details →
                                </Link>                                <button
                                    onClick={() => onDownload(torrent.magnetLink)}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105"
                                >
                                    ⬇️ Quick Download
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
