// Downloads Feature - DownloadsSummary Component
'use client'

import type { DownloadsSummary } from '../types'

interface DownloadsSummaryProps {
    summary: DownloadsSummary
}

export function DownloadsSummary({ summary }: DownloadsSummaryProps) {
    if (summary.total === 0) return null

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 mb-1">Total Torrents</p>
                    <p className="text-white font-semibold text-lg">{summary.total}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Downloading</p>
                    <p className="text-blue-400 font-semibold text-lg">{summary.downloading}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Seeding</p>
                    <p className="text-green-400 font-semibold text-lg">{summary.seeding}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Paused</p>
                    <p className="text-yellow-400 font-semibold text-lg">{summary.paused}</p>
                </div>
            </div>
        </div>
    )
}
