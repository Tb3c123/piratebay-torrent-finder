// Torrents Feature - TorrentList Component
'use client'

import { TorrentCard } from './TorrentCard'
import type { Torrent } from '../types'

interface TorrentListProps {
    torrents: Torrent[]
    loading?: boolean
    loadingMore?: boolean
    error?: string
    emptyMessage?: string
    onLoadMore?: () => void
    hasMore?: boolean
}

export function TorrentList({
    torrents,
    loading = false,
    loadingMore = false,
    error,
    emptyMessage = 'No torrents found. Try a different search.',
    onLoadMore,
    hasMore = false,
}: TorrentListProps) {
    // Loading state
    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Searching for torrents...</p>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
            </div>
        )
    }

    // Empty state
    if (torrents.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-800 rounded-lg">
                <p className="text-gray-400 text-lg">{emptyMessage}</p>
            </div>
        )
    }

    // Results state
    return (
        <div>
            {/* Torrent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {torrents.map((torrent) => (
                    <TorrentCard key={torrent.id} torrent={torrent} />
                ))}
            </div>

            {/* Load More Button */}
            {onLoadMore && hasMore && (
                <div className="text-center">
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
                                Loading more results...
                            </>
                        ) : (
                            <>📥 Load More Results</>
                        )}
                    </button>
                    <p className="text-gray-500 text-sm mt-3">
                        Currently showing {torrents.length} results
                    </p>
                </div>
            )}

            {/* End of Results Message */}
            {!hasMore && torrents.length >= 30 && (
                <div className="text-center py-6 bg-gray-800/50 rounded-lg border border-gray-700">
                    <p className="text-gray-400 text-lg">
                        ✅ End of results - Showing all {torrents.length} torrents
                    </p>
                </div>
            )}
        </div>
    )
}
