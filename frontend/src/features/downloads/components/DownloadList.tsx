// Downloads Feature - DownloadList Component
'use client'

import type { Torrent } from '../types'
import { DownloadCard } from './DownloadCard'

interface DownloadListProps {
    torrents: Torrent[]
    loading: boolean
    onPause: (hash: string) => void
    onResume: (hash: string) => void
    onForceStart: (hash: string) => void
    onDelete: (hash: string) => void
}

export function DownloadList({
    torrents,
    loading,
    onPause,
    onResume,
    onForceStart,
    onDelete,
}: DownloadListProps) {
    // Loading state
    if (loading && torrents.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading downloads...</p>
                </div>
            </div>
        )
    }

    // Empty state
    if (torrents.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-lg mb-2">📭 No active downloads</p>
                <p className="text-gray-500 text-sm">
                    Start downloading a torrent to see it here
                </p>
            </div>
        )
    }

    // Torrents list
    return (
        <div className="space-y-4">
            {torrents.map((torrent) => (
                <DownloadCard
                    key={torrent.hash}
                    torrent={torrent}
                    onPause={onPause}
                    onResume={onResume}
                    onForceStart={onForceStart}
                    onDelete={onDelete}
                />
            ))}
        </div>
    )
}
