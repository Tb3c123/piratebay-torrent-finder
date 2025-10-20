/**
 * Downloads Page
 * Monitor and manage torrents downloading in qBittorrent
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Torrent {
    hash: string
    name: string
    size: number
    progress: number
    dlspeed: number
    upspeed: number
    downloaded: number
    uploaded: number
    eta: number
    state: string
    save_path: string
    added_on: number
    completion_on: number
    num_seeds: number
    num_leechs: number
    ratio: number
}

export default function DownloadsPage() {
    const router = useRouter()
    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)

    useEffect(() => {
        loadTorrents()

        // Auto-refresh every 3 seconds if enabled
        if (autoRefresh) {
            const interval = setInterval(loadTorrents, 3000)
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const loadTorrents = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/qbittorrent/torrents`)
            if (response.data.success) {
                setTorrents(response.data.torrents)
                setError(null)
            }
        } catch (err: any) {
            console.error('Failed to load torrents:', err)
            setError(err.response?.data?.error || 'Failed to load torrents')
        } finally {
            setLoading(false)
        }
    }

    const handlePause = async (hash: string) => {
        try {
            await axios.post(`${API_URL}/api/qbittorrent/pause/${hash}`)
            loadTorrents()
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to pause torrent')
        }
    }

    const handleResume = async (hash: string) => {
        try {
            await axios.post(`${API_URL}/api/qbittorrent/resume/${hash}`)
            loadTorrents()
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to resume torrent')
        }
    }

    const handleForceStart = async (hash: string) => {
        try {
            await axios.post(`${API_URL}/api/qbittorrent/force-start/${hash}`)
            loadTorrents()
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to force start torrent')
        }
    }

    const handleDelete = async (hash: string) => {
        // Show options modal for delete
        const action = window.prompt(
            'Delete torrent:\n\n' +
            '1 - Remove from list only (keep files)\n' +
            '2 - Delete torrent AND files\n' +
            '0 - Cancel\n\n' +
            'Enter your choice (0/1/2):',
            '1'
        )

        if (action === '0' || action === null) return

        const deleteFiles = action === '2'

        const confirmMsg = deleteFiles
            ? '⚠️ Are you sure? This will DELETE ALL FILES from disk!'
            : 'Remove torrent from list? (files will be kept)'

        if (!confirm(confirmMsg)) return

        try {
            await axios.delete(`${API_URL}/api/qbittorrent/delete/${hash}?deleteFiles=${deleteFiles}`)
            loadTorrents()
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete torrent')
        }
    }

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatSpeed = (bytesPerSecond: number): string => {
        return formatBytes(bytesPerSecond) + '/s'
    }

    const formatETA = (seconds: number): string => {
        if (seconds === 8640000 || seconds < 0) return '∞'
        if (seconds === 0) return 'Done'

        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) return `${hours}h ${minutes}m`
        if (minutes > 0) return `${minutes}m ${secs}s`
        return `${secs}s`
    }

    const getStateDisplay = (state: string): { text: string; color: string; icon: string } => {
        const stateMap: Record<string, { text: string; color: string; icon: string }> = {
            downloading: { text: 'Downloading', color: 'text-blue-400', icon: '⬇️' },
            uploading: { text: 'Seeding', color: 'text-green-400', icon: '⬆️' },
            pausedDL: { text: 'Paused', color: 'text-yellow-400', icon: '⏸️' },
            pausedUP: { text: 'Paused', color: 'text-yellow-400', icon: '⏸️' },
            stoppedDL: { text: 'Stopped', color: 'text-gray-400', icon: '⏹️' },
            stoppedUP: { text: 'Stopped', color: 'text-gray-400', icon: '⏹️' },
            stalledDL: { text: 'Stalled', color: 'text-orange-400', icon: '⏳' },
            stalledUP: { text: 'Stalled', color: 'text-orange-400', icon: '⏳' },
            checkingDL: { text: 'Checking', color: 'text-purple-400', icon: '🔍' },
            checkingUP: { text: 'Checking', color: 'text-purple-400', icon: '🔍' },
            queuedDL: { text: 'Queued', color: 'text-gray-400', icon: '⏱️' },
            queuedUP: { text: 'Queued', color: 'text-gray-400', icon: '⏱️' },
            allocating: { text: 'Allocating', color: 'text-purple-400', icon: '💾' },
            metaDL: { text: 'Metadata', color: 'text-cyan-400', icon: '📋' },
            forcedDL: { text: 'Force DL', color: 'text-emerald-400', icon: '⚡' },
            forcedUP: { text: 'Force Seed', color: 'text-emerald-400', icon: '⚡' },
            error: { text: 'Error', color: 'text-red-400', icon: '❌' },
            missingFiles: { text: 'Missing Files', color: 'text-red-400', icon: '❌' },
            unknown: { text: 'Unknown', color: 'text-gray-400', icon: '❓' }
        }

        return stateMap[state] || stateMap.unknown
    }

    if (loading && torrents.length === 0) {
        return (
            <div className="min-h-screen bg-gray-900">
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-400">Loading downloads...</p>
                    </div>
                </div>
            </div>
        )
    }

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
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            className={`px-4 py-2 rounded-lg transition-colors font-semibold ${autoRefresh
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
                        </button>

                        <button
                            onClick={() => loadTorrents()}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Torrents List */}
                {torrents.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-12 text-center">
                        <p className="text-gray-400 text-lg mb-2">📭 No active downloads</p>
                        <p className="text-gray-500 text-sm">Start downloading a torrent to see it here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {torrents.map((torrent) => {
                            const stateInfo = getStateDisplay(torrent.state)
                            const isPaused = torrent.state.includes('paused')
                            const isComplete = torrent.progress >= 1

                            return (
                                <div
                                    key={torrent.hash}
                                    className="bg-gray-800 border border-gray-700 rounded-lg p-5 hover:border-blue-500 transition-all"
                                >
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
                                                <span className="text-gray-400">
                                                    {formatBytes(torrent.size)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                                            {/* Start/Resume - Green */}
                                            <button
                                                onClick={() => handleResume(torrent.hash)}
                                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-green-500/50"
                                                title="Start"
                                            >
                                                ▶️ Start
                                            </button>

                                            {/* Force Start - Emerald */}
                                            <button
                                                onClick={() => handleForceStart(torrent.hash)}
                                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-emerald-500/50"
                                                title="Force Start (bypass queue)"
                                            >
                                                ⚡ Force
                                            </button>

                                            {/* Pause - Yellow */}
                                            <button
                                                onClick={() => handlePause(torrent.hash)}
                                                className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-semibold shadow-lg hover:shadow-yellow-500/50"
                                                title="Pause"
                                            >
                                                ⏸️ Pause
                                            </button>

                                            {/* Delete - Red with icon */}
                                            <button
                                                onClick={() => handleDelete(torrent.hash)}
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
                                            <p className="text-purple-400 font-semibold">
                                                ⏱️ {formatETA(torrent.eta)}
                                            </p>
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
                        })}
                    </div>
                )}

                {/* Summary Stats */}
                {torrents.length > 0 && (
                    <div className="mt-6 bg-gray-800 rounded-lg p-6">
                        <h3 className="text-white font-semibold mb-4">Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Total Torrents</p>
                                <p className="text-white font-semibold text-lg">
                                    {torrents.length}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Downloading</p>
                                <p className="text-blue-400 font-semibold text-lg">
                                    {torrents.filter(t => t.state === 'downloading').length}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Seeding</p>
                                <p className="text-green-400 font-semibold text-lg">
                                    {torrents.filter(t => t.state === 'uploading').length}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Paused</p>
                                <p className="text-yellow-400 font-semibold text-lg">
                                    {torrents.filter(t => t.state.includes('paused')).length}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
