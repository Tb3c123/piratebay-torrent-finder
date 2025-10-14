'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { useManualCache } from '@/hooks/useSessionCache'

interface TorrentBasic {
    id: string
    title: string
    magnetLink: string
    size: string
    uploaded: string
    seeders: number
    leechers: number
    detailsUrl: string | null
    category?: string
    username?: string
    status?: string
    infoHash?: string
    imdb?: string | null
}

interface TorrentDetail extends TorrentBasic {
    description?: string
    info?: Record<string, string>
    files?: Array<{ name: string; size: string }>
    comments?: Array<{ user: string; date: string; text: string }>
}

export default function TorrentDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [torrent, setTorrent] = useState<TorrentDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [loadingDetails, setLoadingDetails] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [downloadStatus, setDownloadStatus] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [activeTab, setActiveTab] = useState<'info' | 'files' | 'description' | 'comments'>('info')

    // Use manual cache hook for more control
    const { getCached, saveToCache } = useManualCache(`torrent_${params.id}`)

    useEffect(() => {
        loadTorrentDetails()
    }, [params.id, searchParams])

    const loadTorrentDetails = async () => {
        try {
            // Try to get data from query params first (new method)
            const title = searchParams.get('title')
            const magnet = searchParams.get('magnet')

            let basicTorrent: TorrentBasic

            if (title && magnet) {
                // New method: from query params
                basicTorrent = {
                    id: params.id,
                    title: title,
                    magnetLink: magnet,
                    size: searchParams.get('size') || 'Unknown',
                    uploaded: searchParams.get('uploaded') || 'Unknown',
                    seeders: parseInt(searchParams.get('seeders') || '0'),
                    leechers: parseInt(searchParams.get('leechers') || '0'),
                    detailsUrl: null
                }

                // Save to cache for refresh persistence
                saveToCache(basicTorrent)
            } else {
                // Try to restore from cache (for F5 refresh)
                const cachedData = getCached<TorrentBasic>()
                if (cachedData) {
                    basicTorrent = cachedData
                } else {
                    // Old method: try to decode JSON from URL (backward compatibility)
                    try {
                        const decodedData = decodeURIComponent(params.id)
                        basicTorrent = JSON.parse(decodedData)
                        saveToCache(basicTorrent)
                    } catch (e) {
                        throw new Error('Invalid torrent data. Please search again.')
                    }
                }
            }

            // Validate required fields
            if (!basicTorrent.title || !basicTorrent.magnetLink) {
                throw new Error('Invalid torrent data: missing required fields')
            }

            // Fetch full details from backend if we have an ID
            if (basicTorrent.id && basicTorrent.id !== 'unknown') {
                try {
                    const response = await axios.get(`http://localhost:3001/api/torrent/${basicTorrent.id}`)
                    // Set all data together after loading is complete
                    const fullData = { ...basicTorrent, ...response.data }
                    setTorrent(fullData)
                    // Update cache with full data
                    saveToCache(fullData)
                } catch (err) {
                    console.log('Could not fetch full details, using basic info only')
                    setTorrent(basicTorrent)
                }
            } else {
                setTorrent(basicTorrent)
            }

            setLoading(false)
            setLoadingDetails(false)
        } catch (err: any) {
            console.error('Error loading torrent details:', err)
            setError(`Failed to load torrent: ${err.message || 'Invalid URL or data'}`)
            setLoading(false)
            setLoadingDetails(false)
            // Don't redirect - stay on page and show error
        }
    }

    const handleDownload = async () => {
        if (!torrent) return

        setDownloading(true)
        setDownloadStatus('')
        setError('')

        try {
            const response = await axios.post('http://localhost:3001/api/qbittorrent/download', {
                magnetLink: torrent.magnetLink
            })

            setDownloadStatus('✅ Download started successfully!')

            // Redirect to logs page after 2 seconds
            setTimeout(() => {
                router.push('/logs')
            }, 2000)
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to start download')
        } finally {
            setDownloading(false)
        }
    }

    const copyMagnetLink = () => {
        if (torrent) {
            navigator.clipboard.writeText(torrent.magnetLink)
            setDownloadStatus('📋 Magnet link copied to clipboard!')
            setTimeout(() => setDownloadStatus(''), 3000)
        }
    }

    const getHealthColor = (seeders: number) => {
        if (seeders >= 100) return 'text-green-400'
        if (seeders >= 10) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getHealthLabel = (seeders: number) => {
        if (seeders >= 100) return 'Excellent'
        if (seeders >= 10) return 'Good'
        return 'Poor'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading torrent details...</p>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we fetch description and files...</p>
                </div>
            </div>
        )
    }

    if (error && !torrent) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                        <p className="text-red-400 text-lg">❌ {error}</p>
                        <button
                            onClick={() => router.back()}
                            className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (!torrent) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">Torrent Details</h1>
                    <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded"></div>
                </div>

                {/* Main Content */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
                    {/* Title Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
                        <h2 className="text-2xl font-bold text-white break-words">
                            {torrent.title}
                        </h2>
                    </div>

                    {/* Info Grid */}
                    <div className="p-6 space-y-6">
                        {/* Tabs Navigation */}
                        <div className="flex gap-2 border-b border-gray-700">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'info'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                📊 Info
                            </button>
                            {torrent.description && (
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'description'
                                        ? 'text-blue-400 border-b-2 border-blue-400'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    📝 Description
                                </button>
                            )}
                            {torrent.files && torrent.files.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('files')}
                                    className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'files'
                                        ? 'text-blue-400 border-b-2 border-blue-400'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    📁 Files ({torrent.files.length})
                                </button>
                            )}
                            {torrent.comments && torrent.comments.length > 0 && (
                                <button
                                    onClick={() => setActiveTab('comments')}
                                    className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'comments'
                                        ? 'text-blue-400 border-b-2 border-blue-400'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    💬 Comments ({torrent.comments.length})
                                </button>
                            )}
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                {/* Health Status */}
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white">Health Status</h3>
                                        <span className={`text-lg font-bold ${getHealthColor(torrent.seeders)}`}>
                                            {getHealthLabel(torrent.seeders)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                                            <div className="text-3xl font-bold text-green-400">{torrent.seeders}</div>
                                            <div className="text-sm text-gray-400 mt-1">Seeders</div>
                                        </div>
                                        <div className="text-center p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                                            <div className="text-3xl font-bold text-red-400">{torrent.leechers}</div>
                                            <div className="text-sm text-gray-400 mt-1">Leechers</div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Information */}
                                <div className="space-y-3">
                                    <h3 className="text-xl font-semibold text-white mb-4">File Information</h3>

                                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                        <span className="text-gray-400">Size:</span>
                                        <span className="text-white font-semibold">{torrent.size}</span>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                        <span className="text-gray-400">Uploaded:</span>
                                        <span className="text-white font-semibold">{torrent.uploaded}</span>
                                    </div>

                                    {torrent.category && (
                                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                            <span className="text-gray-400">Category:</span>
                                            <span className="text-white font-semibold">{torrent.category}</span>
                                        </div>
                                    )}

                                    {torrent.username && (
                                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                            <span className="text-gray-400">Uploader:</span>
                                            <span className="text-white font-semibold">{torrent.username}</span>
                                        </div>
                                    )}

                                    {torrent.infoHash && (
                                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                            <span className="text-gray-400">Info Hash:</span>
                                            <span className="text-white font-mono text-xs break-all">{torrent.infoHash}</span>
                                        </div>
                                    )}

                                    {torrent.imdb && (
                                        <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                            <span className="text-gray-400">IMDb:</span>
                                            <a
                                                href={`https://www.imdb.com/title/tt${torrent.imdb}/`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-yellow-400 hover:text-yellow-300 font-semibold"
                                            >
                                                tt{torrent.imdb} →
                                            </a>
                                        </div>
                                    )}

                                    {/* Additional Info from scraping */}
                                    {torrent.info && Object.keys(torrent.info).length > 0 && (
                                        <>
                                            <h3 className="text-xl font-semibold text-white mt-6 mb-4">Additional Information</h3>
                                            {Object.entries(torrent.info).map(([key, value]) => (
                                                <div key={key} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                                    <span className="text-gray-400">{key}:</span>
                                                    <span className="text-white font-semibold">{value}</span>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'description' && torrent.description && (
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                                <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm overflow-x-auto">
                                    {torrent.description}
                                </pre>
                            </div>
                        )}

                        {activeTab === 'files' && torrent.files && torrent.files.length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">File List</h3>
                                <div className="space-y-2">
                                    {torrent.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <span className="text-gray-300 text-sm break-all pr-4">{file.name}</span>
                                            <span className="text-gray-400 text-sm whitespace-nowrap">{file.size}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'comments' && torrent.comments && torrent.comments.length > 0 && (
                            <div className="bg-gray-900 rounded-lg p-6">
                                <h3 className="text-xl font-semibold text-white mb-4">Comments</h3>
                                <div className="space-y-4">
                                    {torrent.comments.map((comment, index) => (
                                        <div key={index} className="p-4 bg-gray-800 rounded border border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-blue-400 font-semibold">{comment.user}</span>
                                                <span className="text-gray-500 text-sm">{comment.date}</span>
                                            </div>
                                            <p className="text-gray-300 text-sm">{comment.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}                        {/* Magnet Link Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-3">Magnet Link</h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={torrent.magnetLink}
                                    readOnly
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-300 text-sm"
                                />
                                <button
                                    onClick={copyMagnetLink}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
                                >
                                    📋 Copy
                                </button>
                            </div>
                        </div>

                        {/* Status Messages */}
                        {downloadStatus && (
                            <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 text-center">
                                <p className="text-green-400">{downloadStatus}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
                                <p className="text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg transition-all transform hover:scale-105 disabled:scale-100 font-semibold text-lg"
                            >
                                {downloading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                                        Starting Download...
                                    </span>
                                ) : (
                                    '⬇️ Download with qBittorrent'
                                )}
                            </button>

                            {torrent.detailsUrl && (
                                <a
                                    href={torrent.detailsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
                                >
                                    🔗 View on TPB
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warning Box */}
                <div className="mt-6 bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                    <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>Note:</strong> Make sure qBittorrent is running and the Web UI is accessible at the configured address.
                        Always verify the content and use a VPN when downloading torrents.
                    </p>
                </div>
            </div>
        </div>
    )
}
