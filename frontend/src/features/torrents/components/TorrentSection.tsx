// Torrent Section Component - Combines search controls and torrent list
'use client'

import { TorrentList } from './TorrentList'
import { AlternativeSearch } from './AlternativeSearch'
import { Torrent } from '@/lib/types'

interface TorrentSectionProps {
    torrents: Torrent[]
    loading: boolean
    error?: string
    alternativeTitles: string[]
    onRefresh: () => void
    onAlternativeSearch: (query: string) => void
    onDownload?: (magnetLink: string, name: string) => void
    refreshLabel?: string
    sectionTitle?: string
}

export function TorrentSection({
    torrents,
    loading,
    error,
    alternativeTitles,
    onRefresh,
    onAlternativeSearch,
    onDownload,
    refreshLabel = '🔄 Refresh',
    sectionTitle = 'Available Torrents'
}: TorrentSectionProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{sectionTitle}</h2>
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:bg-gray-600 transition-colors"
                >
                    {loading ? 'Searching...' : refreshLabel}
                </button>
            </div>

            {/* Alternative Search */}
            {alternativeTitles.length > 0 && (
                <div className="mb-6">
                    <AlternativeSearch
                        titles={alternativeTitles}
                        onSearch={onAlternativeSearch}
                        loading={loading}
                    />
                </div>
            )}

            {/* Torrent List */}
            <TorrentList
                torrents={torrents}
                loading={loading}
                error={error}
                onDownload={onDownload}
            />
        </div>
    )
}
