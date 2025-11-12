// Downloads Feature - DownloadCard Component
'use client'

import type { Torrent } from '../types'
import { formatBytes, formatSpeed, formatETA, getStateDisplay } from '../utils'

interface DownloadCardProps {
    torrent: Torrent
    onPause: (hash: string) => void
    onResume: (hash: string) => void
    onForceStart: (hash: string) => void
    onDelete: (hash: string) => void
}

export function DownloadCard({
    torrent,
    onPause,
    onResume,
    onForceStart,
    onDelete,
}: DownloadCardProps) {
    const stateInfo = getStateDisplay(torrent.state)
    const isComplete = torrent.progress >= 1

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-all">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-2 break-words">
                        {torrent.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                        <span className={`font-semibold ${stateInfo.color}`}>
                            {stateInfo.icon} {stateInfo.text}
                        </span>
                        <span className="text-gray-400">{formatBytes(torrent.size)}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button
                        onClick={() => onResume(torrent.hash)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-green-500/50"
                        title="Start"
                    >
                        ▶️ Start
                    </button>

                    <button
                        onClick={() => onForceStart(torrent.hash)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-emerald-500/50"
                        title="Force Start (bypass queue)"
                    >
                        ⚡ Force
                    </button>

                    <button
                        onClick={() => onPause(torrent.hash)}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-yellow-500/50"
                        title="Pause"
                    >
                        ⏸️ Pause
                    </button>

                    <button
                        onClick={() => onDelete(torrent.hash)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-red-500/50"
                        title="Delete (choose option)"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">
                        {(torrent.progress * 100).toFixed(1)}%
                    </span>
                    <span className="text-gray-400">
                        {formatBytes(torrent.downloaded)} / {formatBytes(torrent.size)}
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-full transition-all rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                        style={{ width: `${Math.min(torrent.progress * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-gray-500 mb-1">Download Speed</p>
                    <p className="text-blue-400 font-semibold">
                        ⬇️ {formatSpeed(torrent.dlspeed)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Upload Speed</p>
                    <p className="text-green-400 font-semibold">
                        ⬆️ {formatSpeed(torrent.upspeed)}
                    </p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">ETA</p>
                    <p className="text-purple-400 font-semibold">⏱️ {formatETA(torrent.eta)}</p>
                </div>
                <div>
                    <p className="text-gray-500 mb-1">Seeds / Peers</p>
                    <p className="text-yellow-400 font-semibold">
                        🌱 {torrent.num_seeds} / 👥 {torrent.num_leechs}
                    </p>
                </div>
            </div>

            {/* Save Path */}
            <div className="mt-3 pt-3 border-t border-gray-700">
                <p className="text-xs text-gray-500">Save Path:</p>
                <p className="text-xs text-gray-400 font-mono break-all">
                    {torrent.save_path}
                </p>
            </div>
        </div>
    )
}
