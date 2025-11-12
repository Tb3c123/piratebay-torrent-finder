'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Log {
    id: number
    level: 'info' | 'success' | 'warning' | 'error' | 'debug'
    action: string  // Backend uses 'action' not 'message'
    timestamp: string  // Unix timestamp as string, needs parsing
    details?: string  // JSON string, needs parsing
}

interface CacheStats {
    omdb: { size: number; ttl: string }
    movies: { size: number; ttl: string }
    torrents: { size: number; ttl: string }
    sections: { size: number; ttl: string; keys: string[] }
}

// Dropdown component
function Dropdown({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
                <span>{icon}</span>
                <span>{label}</span>
                <span className={`text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop to close dropdown */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Dropdown menu */}
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-20 min-w-[200px]">
                        {children}
                    </div>
                </>
            )}
        </div>
    )
}

function DropdownItem({ icon, label, onClick, variant = 'default' }: {
    icon: string
    label: string
    onClick: () => void
    variant?: 'default' | 'danger'
}) {
    const colorClass = variant === 'danger'
        ? 'hover:bg-red-900/30 text-red-400'
        : 'hover:bg-gray-700 text-white'

    return (
        <button
            onClick={onClick}
            className={`w-full px-4 py-2 text-left ${colorClass} transition-colors flex items-center gap-2`}
        >
            <span>{icon}</span>
            <span>{label}</span>
        </button>
    )
}

export default function LogsPage() {
    const router = useRouter()
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(true)
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [filterLevel, setFilterLevel] = useState<'all' | 'info' | 'success' | 'warning' | 'error' | 'debug'>('all')
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    const fetchLogs = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/logs`)
            const data = await response.json()

            // API returns { success: true, data: { logs: [...], total: N } }
            if (data.success && data.data && data.data.logs) {
                setLogs(data.data.logs)
            } else if (Array.isArray(data)) {
                // Fallback for old format
                setLogs(data)
            } else {
                setLogs([])
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const fetchCacheStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/system/cache/stats`)
            const data = await response.json()
            if (data.success && data.data && data.data.stats) {
                setCacheStats(data.data.stats)
            }
        } catch (error) {
            console.error('Failed to fetch cache stats:', error)
        }
    }

    useEffect(() => {
        fetchLogs()
        fetchCacheStats()
    }, [])

    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetchLogs()
                fetchCacheStats()
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [autoRefresh])

    const clearCache = async (type: string) => {
        try {
            const response = await fetch(`${API_URL}/api/system/cache/clear/${type}`, {
                method: 'POST'
            })
            const data = await response.json()
            if (data.success && data.data) {
                const cleared = data.data.cleared || []
                alert(`✓ ${data.message}\n\nCleared: ${cleared.join(', ')}`)
                fetchCacheStats() // Refresh stats
            } else {
                alert(`❌ Failed: ${data.error || 'Unknown error'}`)
            }
        } catch (error) {
            console.error('Failed to clear cache:', error)
            alert('❌ Failed to clear cache')
        }
    }

    const clearLogs = async () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            try {
                const response = await fetch(`${API_URL}/api/v1/logs`, {
                    method: 'DELETE'
                })
                if (response.ok) {
                    await fetchLogs()
                }
            } catch (error) {
                console.error('Failed to clear logs:', error)
            }
        }
    }

    const cleanupHistory = async () => {
        if (confirm('Remove search history older than 30 days?')) {
            try {
                const response = await fetch(`${API_URL}/api/v1/history/cleanup`, {
                    method: 'POST'
                })
                const data = await response.json()
                if (data.success && data.data) {
                    alert(`✓ Removed ${data.data.removed} old entries`)
                } else {
                    alert('✓ ' + (data.message || 'Cleanup completed'))
                }
            } catch (error) {
                console.error('Failed to cleanup history:', error)
                alert('❌ Failed to cleanup history')
            }
        }
    }

    const restartBackend = async () => {
        if (confirm('Restart the backend server? It will take ~5 seconds.')) {
            try {
                await fetch(`${API_URL}/api/system/restart`, {
                    method: 'POST'
                })
                alert('✓ Backend restart initiated. Please wait 5 seconds.')
            } catch (error) {
                console.error('Failed to restart backend:', error)
            }
        }
    }

    const restartFrontend = () => {
        if (confirm('Restart the frontend? This will reload the page.')) {
            window.location.reload()
        }
    }

    const filteredLogs = filterLevel === 'all'
        ? logs
        : logs.filter(log => log.level === filterLevel)

    const getLevelBg = (level: string) => {
        switch (level) {
            case 'error': return 'bg-red-900/20'
            case 'warning': return 'bg-yellow-900/20'
            case 'info': return 'bg-blue-900/20'
            default: return 'bg-gray-800'
        }
    }

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-400'
            case 'warning': return 'text-yellow-400'
            case 'success': return 'text-green-400'
            case 'info': return 'text-blue-400'
            case 'debug': return 'text-gray-400'
            default: return 'text-gray-400'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading logs...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">System Logs</h1>
                        <p className="text-gray-400">Monitor server activity and errors</p>
                    </div>
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>

                {/* Control Panel - Organized with Dropdowns */}
                <div className="mb-6 space-y-4">
                    {/* Row 1: Dropdown Groups */}
                    <div className="flex flex-wrap gap-3">
                        {/* Cache Management Dropdown */}
                        <Dropdown label="Cache Management" icon="🗄️">
                            <DropdownItem
                                icon="📡"
                                label={`Clear OMDB Cache (${cacheStats?.omdb.size || 0} entries)`}
                                onClick={() => clearCache('omdb')}
                            />
                            <DropdownItem
                                icon="🎬"
                                label={`Clear Movie Cache (${cacheStats?.movies.size || 0} entries)`}
                                onClick={() => clearCache('movies')}
                            />
                            <DropdownItem
                                icon="🧲"
                                label={`Clear Torrent Cache (${cacheStats?.torrents.size || 0} entries)`}
                                onClick={() => clearCache('torrents')}
                            />
                            <DropdownItem
                                icon="📺"
                                label={`Clear Section Cache (${cacheStats?.sections.size || 0} entries)`}
                                onClick={() => clearCache('sections')}
                            />
                            <div className="border-t border-gray-700 my-1" />
                            <DropdownItem
                                icon="🧹"
                                label="Clear All Caches"
                                onClick={() => clearCache('all')}
                                variant="danger"
                            />
                        </Dropdown>

                        {/* System Actions Dropdown */}
                        <Dropdown label="System Actions" icon="⚙️">
                            <DropdownItem
                                icon="🔄"
                                label="Restart Backend"
                                onClick={restartBackend}
                            />
                            <DropdownItem
                                icon="🔄"
                                label="Restart Frontend"
                                onClick={restartFrontend}
                            />
                            <div className="border-t border-gray-700 my-1" />
                            <DropdownItem
                                icon="🧹"
                                label="Cleanup History (>30d)"
                                onClick={cleanupHistory}
                            />
                        </Dropdown>

                        {/* Logs Management Dropdown */}
                        <Dropdown label="Logs" icon="📋">
                            <DropdownItem
                                icon="🔄"
                                label="Refresh Logs"
                                onClick={fetchLogs}
                            />
                            <div className="border-t border-gray-700 my-1" />
                            <DropdownItem
                                icon="🗑️"
                                label="Clear Logs"
                                onClick={clearLogs}
                                variant="danger"
                            />
                        </Dropdown>

                        {/* Auto-refresh Toggle */}
                        <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="w-4 h-4"
                            />
                            <span>Auto-refresh (5s)</span>
                        </label>
                    </div>

                    {/* Row 2: Cache Stats Display */}
                    {cacheStats && (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-gray-400 text-sm font-semibold">📊 Cache Statistics</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-gray-400 text-xs font-semibold uppercase mb-1">OMDB API</div>
                                    <div className="text-white font-mono">
                                        <span className="text-blue-400 font-bold">{cacheStats.omdb.size}</span> entries
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">TTL: {cacheStats.omdb.ttl}</div>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-gray-400 text-xs font-semibold uppercase mb-1">Movies</div>
                                    <div className="text-white font-mono">
                                        <span className="text-green-400 font-bold">{cacheStats.movies.size}</span> entries
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">TTL: {cacheStats.movies.ttl}</div>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-gray-400 text-xs font-semibold uppercase mb-1">Torrents</div>
                                    <div className="text-white font-mono">
                                        <span className="text-purple-400 font-bold">{cacheStats.torrents.size}</span> entries
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">TTL: {cacheStats.torrents.ttl}</div>
                                </div>
                                <div className="bg-gray-900/50 p-3 rounded-lg">
                                    <div className="text-gray-400 text-xs font-semibold uppercase mb-1">Sections</div>
                                    <div className="text-white font-mono">
                                        <span className="text-yellow-400 font-bold">{cacheStats.sections.size}</span> entries
                                    </div>
                                    <div className="text-gray-500 text-xs mt-1">TTL: {cacheStats.sections.ttl}</div>
                                    {cacheStats.sections.keys && cacheStats.sections.keys.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-700">
                                            <div className="text-gray-500 text-xs mb-1">Keys:</div>
                                            {cacheStats.sections.keys.map((key, idx) => (
                                                <div key={idx} className="text-gray-400 text-xs font-mono">
                                                    • {key}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Row 3: Filter Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilterLevel('all')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            All ({logs.length})
                        </button>
                        <button
                            onClick={() => setFilterLevel('error')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Errors ({logs.filter(l => l.level === 'error').length})
                        </button>
                        <button
                            onClick={() => setFilterLevel('warning')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'warning'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Warnings ({logs.filter(l => l.level === 'warning').length})
                        </button>
                        <button
                            onClick={() => setFilterLevel('success')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'success'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Success ({logs.filter(l => l.level === 'success').length})
                        </button>
                        <button
                            onClick={() => setFilterLevel('info')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'info'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Info ({logs.filter(l => l.level === 'info').length})
                        </button>
                        <button
                            onClick={() => setFilterLevel('debug')}
                            className={`px-4 py-2 rounded-lg transition-colors ${filterLevel === 'debug'
                                ? 'bg-gray-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Debug ({logs.filter(l => l.level === 'debug').length})
                        </button>
                    </div>
                </div>

                {/* Logs */}
                <div className="space-y-2">
                    {filteredLogs.length === 0 ? (
                        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                            No logs to display
                        </div>
                    ) : (
                        filteredLogs.map((log) => (
                            <div
                                key={log.id}
                                className={`${getLevelBg(log.level)} rounded-lg p-4 border border-gray-700`}
                            >
                                <div className="flex items-start gap-4">
                                    <span className={`font-mono text-xs ${getLevelColor(log.level)} uppercase`}>
                                        {log.level}
                                    </span>
                                    <span className="text-gray-400 text-xs font-mono">
                                        {new Date(parseFloat(log.timestamp)).toLocaleString()}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-white">{log.action}</p>
                                        {log.details && (
                                            <pre className="mt-2 text-xs text-gray-400 bg-gray-900/50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                                {(() => {
                                                    try {
                                                        // Try to parse JSON string
                                                        const parsed = typeof log.details === 'string'
                                                            ? JSON.parse(log.details)
                                                            : log.details
                                                        return JSON.stringify(parsed, null, 2)
                                                    } catch (e) {
                                                        // If not JSON, return as is
                                                        return log.details
                                                    }
                                                })()}
                                            </pre>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
