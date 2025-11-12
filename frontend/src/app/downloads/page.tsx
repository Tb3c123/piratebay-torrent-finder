/**
 * Downloads Page
 * Monitor and manage torrents downloading in qBittorrent
 */

'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
    useDownloads,
    useDownloadActions,
    DownloadList,
    DownloadsSummaryCard,
    calculateSummary,
} from '@/features/downloads'
import { Alert } from '@/components/ui'

export default function DownloadsPage() {
    const { user } = useAuth()
    const { torrents, loading, error, autoRefresh, toggleAutoRefresh, refresh } =
        useDownloads(user?.id)

    const { pause, resume, forceStart, deleteTorrent } = useDownloadActions(refresh)

    const summary = calculateSummary(torrents)

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Downloads</h1>
                        <p className="text-gray-400">Monitor your qBittorrent downloads</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={toggleAutoRefresh}
                            className={`px-4 py-2 rounded-lg transition-colors font-semibold ${autoRefresh
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
                        </button>

                        <button
                            onClick={refresh}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && <Alert type="error" message={error} className="mb-6" />}

                {/* Torrents List */}
                <DownloadList
                    torrents={torrents}
                    loading={loading}
                    onPause={(hash) => pause(hash, user?.id)}
                    onResume={(hash) => resume(hash, user?.id)}
                    onForceStart={(hash) => forceStart(hash, user?.id)}
                    onDelete={(hash) => deleteTorrent(hash, user?.id)}
                />

                {/* Summary Stats */}
                {torrents.length > 0 && (
                    <div className="mt-6">
                        <DownloadsSummaryCard summary={summary} />
                    </div>
                )}
            </div>
        </div>
    )
}
