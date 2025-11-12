// Shared Torrent List Component
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Torrent } from '@/lib/types'
import { DownloadModal } from '@/features/downloads'

interface TorrentListProps {
    torrents: Torrent[]
    loading?: boolean
    error?: string
    onDownload?: (magnetLink: string, name: string) => void
}

export function TorrentList({
    torrents,
    loading = false,
    error,
    onDownload
}: TorrentListProps) {
    const [showModal, setShowModal] = useState(false)
    const [selectedMagnet, setSelectedMagnet] = useState('')
    const [selectedName, setSelectedName] = useState('')

    const handleDownload = (magnetLink: string, torrentName: string) => {
        if (onDownload) {
            onDownload(magnetLink, torrentName)
            return
        }

        // Open modal for folder selection
        setSelectedMagnet(magnetLink)
        setSelectedName(torrentName)
        setShowModal(true)
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-400">Searching for torrents...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
            </div>
        )
    }

    if (torrents.length === 0) {
        return (
            <p className="text-gray-400 text-center py-8">
                No torrents found. Try searching with an alternative title.
            </p>
        )
    }

    return (
        <div className="space-y-4">
            {torrents.map((torrent, index) => (
                <div
                    key={index}
                    className="bg-gray-800/40 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <h3 className="text-white font-semibold text-lg flex-1 leading-relaxed">
                            {torrent.title}
                        </h3>

                        <div className="flex gap-3">
                            <Link
                                href={`/torrent/${torrent.id || 'unknown'}?${new URLSearchParams({
                                    title: torrent.title,
                                    magnet: torrent.magnetLink,
                                    size: torrent.size,
                                    seeders: torrent.seeders.toString(),
                                    leechers: torrent.leechers.toString(),
                                    uploaded: torrent.uploaded || '',
                                }).toString()}`}
                                className="px-5 py-2.5 bg-blue-500/80 hover:bg-blue-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium whitespace-nowrap"
                            >
                                📄 View Details
                            </Link>
                            <button
                                onClick={() => handleDownload(torrent.magnetLink, torrent.title)}
                                className="px-5 py-2.5 bg-teal-500/80 hover:bg-teal-400 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium whitespace-nowrap"
                            >
                                ⬇️ Download
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="text-emerald-400 font-semibold">
                            🌱 {torrent.seeders} seeders
                        </span>
                        <span className="text-rose-400">
                            📥 {torrent.leechers} leechers
                        </span>
                        <span className="text-sky-400">💾 {torrent.size}</span>
                        <span className="text-gray-400">📅 {torrent.uploaded}</span>
                        {torrent.username && (
                            <span className="text-violet-400">👤 {torrent.username}</span>
                        )}
                    </div>
                </div>
            ))}

            {/* Download Modal */}
            <DownloadModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                magnetLink={selectedMagnet}
                torrentName={selectedName}
            />
        </div>
    )
}
