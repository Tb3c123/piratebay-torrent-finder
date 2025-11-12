// Downloads Feature - DownloadModal Component
/**
 * Download Options Modal
 * Popup to select Jellyfin folder when downloading torrents
 */

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface JellyfinLibrary {
    id: string
    name: string
    type: string
    paths: string[]
}

interface DownloadModalProps {
    isOpen: boolean
    onClose: () => void
    magnetLink: string
    torrentName?: string
    onDownloadStart?: () => void
}

export function DownloadModal({
    isOpen,
    onClose,
    magnetLink,
    torrentName,
    onDownloadStart
}: DownloadModalProps) {
    const { user } = useAuth()
    const [libraries, setLibraries] = useState<JellyfinLibrary[]>([])
    const [selectedLibrary, setSelectedLibrary] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load Jellyfin libraries when modal opens
    useEffect(() => {
        if (isOpen) {
            loadLibraries()
        }
    }, [isOpen])

    const loadLibraries = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await axios.get(`${API_URL}/api/settings/jellyfin/saved-libraries`, {
                params: { userId: user?.id }
            })
            if (response.data.success && response.data.libraries) {
                setLibraries(response.data.libraries)
                // Auto-select first library if available
                if (response.data.libraries.length > 0) {
                    setSelectedLibrary(response.data.libraries[0].id)
                }
            } else {
                setError('No libraries found. Please configure Jellyfin in Settings.')
            }
        } catch (err: any) {
            console.error('Failed to load libraries:', err)
            setError('Failed to load Jellyfin libraries. Please check Settings.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!selectedLibrary) {
            setError('Please select a download location')
            return
        }

        const library = libraries.find(lib => lib.id === selectedLibrary)
        if (!library || !library.paths || library.paths.length === 0) {
            setError('Selected library has no valid path')
            return
        }

        setDownloading(true)
        setError(null)

        try {
            const response = await axios.post(`${API_URL}/api/qbittorrent/add`, {
                magnetLink,
                savePath: library.paths[0], // Use first path from library
                userId: user?.id
            })

            if (response.data.success) {
                // Success!
                if (onDownloadStart) {
                    onDownloadStart()
                }
                alert(`Download started! Saving to: ${library.name}`)
                onClose()
            } else {
                setError('Failed to start download')
            }
        } catch (err: any) {
            console.error('Download failed:', err)
            setError(err.response?.data?.error || 'Failed to start download. Please check qBittorrent settings.')
        } finally {
            setDownloading(false)
        }
    }

    const getLibraryIcon = (type: string) => {
        switch (type) {
            case 'movies':
                return '🎬'
            case 'tvshows':
                return '📺'
            default:
                return '📁'
        }
    }

    const getLibraryTypeLabel = (type: string) => {
        switch (type) {
            case 'movies':
                return 'Movies'
            case 'tvshows':
                return 'TV Shows'
            default:
                return type
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-white">⬇️ Download Options</h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white text-2xl leading-none"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>
                        {torrentName && (
                            <p className="text-sm text-gray-400 truncate">{torrentName}</p>
                        )}
                    </div>

                    {/* Body */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                                <p className="text-gray-400">Loading libraries...</p>
                            </div>
                        ) : error ? (
                            <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                                <button
                                    onClick={() => window.location.href = '/settings'}
                                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
                                >
                                    Go to Settings
                                </button>
                            </div>
                        ) : libraries.length === 0 ? (
                            <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                                <p className="text-yellow-400 text-sm mb-3">
                                    No Jellyfin libraries configured.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/settings'}
                                    className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Configure Jellyfin
                                </button>
                            </div>
                        ) : (
                            <>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Select download location:
                                </label>

                                <div className="space-y-2 mb-6">
                                    {libraries.map((library) => (
                                        <div
                                            key={library.id}
                                            onClick={() => setSelectedLibrary(library.id)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedLibrary === library.id
                                                ? 'border-blue-500 bg-blue-900/30'
                                                : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{getLibraryIcon(library.type)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-semibold truncate">
                                                        {library.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {getLibraryTypeLabel(library.type)}
                                                    </p>
                                                    {library.paths && library.paths.length > 0 && (
                                                        <p className="text-xs text-gray-500 font-mono mt-1 truncate">
                                                            {library.paths[0]}
                                                        </p>
                                                    )}
                                                </div>
                                                {selectedLibrary === library.id && (
                                                    <span className="text-blue-400 text-xl">✓</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                                        disabled={downloading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        disabled={downloading || !selectedLibrary}
                                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {downloading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                <span>Starting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>⬇️</span>
                                                <span>Start Download</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
