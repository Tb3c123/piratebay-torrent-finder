// Torrents Feature - TorrentCard Component
'use client'

import { useRouter } from 'next/navigation'
import type { Torrent } from '../types'

interface TorrentCardProps {
    torrent: Torrent
}

export function TorrentCard({ torrent }: TorrentCardProps) {
    const router = useRouter()

    const getHealthColor = (seeders: number) => {
        if (seeders >= 100) return 'text-green-400'
        if (seeders >= 10) return 'text-yellow-400'
        return 'text-red-400'
    }

    const handleViewDetails = () => {
        // Navigate to details page with query params (better than encoded JSON)
        const params = new URLSearchParams({
            title: torrent.title,
            magnet: torrent.magnetLink,
            size: torrent.size,
            uploaded: torrent.uploaded,
            seeders: torrent.seeders.toString(),
            leechers: torrent.leechers.toString(),
        })

        router.push(`/torrent/${torrent.id}?${params.toString()}`)
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors">
            {/* Title */}
            <h3
                className="text-white font-semibold mb-3 line-clamp-2 hover:text-blue-400 cursor-pointer"
                onClick={handleViewDetails}
            >
                {torrent.title}
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Seeders */}
                <div className="flex items-center justify-between bg-gray-900 rounded px-3 py-2">
                    <span className="text-gray-400 text-sm">Seeders:</span>
                    <span className={`font-bold ${getHealthColor(torrent.seeders)}`}>
                        {torrent.seeders}
                    </span>
                </div>

                {/* Leechers */}
                <div className="flex items-center justify-between bg-gray-900 rounded px-3 py-2">
                    <span className="text-gray-400 text-sm">Leechers:</span>
                    <span className="text-red-400 font-bold">{torrent.leechers}</span>
                </div>

                {/* Size */}
                <div className="flex items-center justify-between bg-gray-900 rounded px-3 py-2">
                    <span className="text-gray-400 text-sm">Size:</span>
                    <span className="text-white font-semibold text-sm">{torrent.size}</span>
                </div>

                {/* Uploaded */}
                <div className="flex items-center justify-between bg-gray-900 rounded px-3 py-2">
                    <span className="text-gray-400 text-sm">Uploaded:</span>
                    <span className="text-white font-semibold text-sm">{torrent.uploaded}</span>
                </div>
            </div>

            {/* Optional Info */}
            {(torrent.category || torrent.username) && (
                <div className="flex gap-2 mb-3 text-xs">
                    {torrent.category && (
                        <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
                            {torrent.category}
                        </span>
                    )}
                    {torrent.username && (
                        <span className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded">
                            👤 {torrent.username}
                        </span>
                    )}
                </div>
            )}

            {/* View Details Button */}
            <button
                onClick={handleViewDetails}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
                📋 View Details
            </button>
        </div>
    )
}
