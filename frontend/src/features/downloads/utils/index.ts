// Downloads Feature - Utility Functions

import type { Torrent, TorrentStateInfo, DownloadsSummary } from '../types'

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format speed with bytes per second
 */
export function formatSpeed(bytesPerSecond: number): string {
    return formatBytes(bytesPerSecond) + '/s'
}

/**
 * Format ETA (Estimated Time of Arrival) in seconds
 */
export function formatETA(seconds: number): string {
    if (seconds === 8640000 || seconds < 0) return '∞'
    if (seconds === 0) return 'Done'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
}

/**
 * Get display information for torrent state
 */
export function getStateDisplay(state: string): TorrentStateInfo {
    const stateMap: Record<string, TorrentStateInfo> = {
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
        unknown: { text: 'Unknown', color: 'text-gray-400', icon: '❓' },
    }

    return stateMap[state] || stateMap.unknown
}

/**
 * Calculate summary statistics for torrents
 */
export function calculateSummary(torrents: Torrent[]): DownloadsSummary {
    return {
        total: torrents.length,
        downloading: torrents.filter((t) => t.state === 'downloading').length,
        seeding: torrents.filter((t) => t.state === 'uploading').length,
        paused: torrents.filter((t) => t.state.includes('paused')).length,
    }
}
