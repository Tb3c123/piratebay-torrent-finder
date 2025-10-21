'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Header() {
    const router = useRouter()
    const [downloadCount, setDownloadCount] = useState(0)

    const handleLogoClick = () => {
        router.push('/')
    }

    const handleDownloadsClick = () => {
        router.push('/downloads')
    }

    // Fetch download count
    useEffect(() => {
        const fetchDownloadCount = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/qbittorrent/torrents`)
                const torrents = response.data.torrents || []
                // Count active downloads (downloading or seeding)
                const activeCount = torrents.filter((t: any) =>
                    t.state === 'downloading' ||
                    t.state === 'uploading' ||
                    t.state === 'stalledDL' ||
                    t.state === 'stalledUP' ||
                    t.state === 'forcedDL' ||
                    t.state === 'forcedUP'
                ).length
                setDownloadCount(activeCount)
            } catch (error) {
                console.error('Failed to fetch download count:', error)
            }
        }

        fetchDownloadCount()
        // Refresh count every 5 seconds
        const interval = setInterval(fetchDownloadCount, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex items-center justify-between w-full">
            <button
                onClick={handleLogoClick}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
                <span className="text-3xl">🏴‍☠️</span>
                <div className="text-left">
                    <h1 className="text-xl font-bold text-white">Pirate Bay Finder</h1>
                    <p className="text-xs text-gray-400">Movie & Torrent Search</p>
                </div>
            </button>

            {/* Downloads Button */}
            <button
                onClick={handleDownloadsClick}
                className="relative p-2 hover:bg-gray-800 rounded-lg transition-all group"
                title="Downloads"
            >
                {/* Download Icon - Outline Style */}
                <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>

                {/* Notification Badge - Always show count */}
                <span className={`absolute -top-1 -right-1 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg ${downloadCount > 0 ? 'bg-red-500' : 'bg-gray-600'
                    }`}>
                    {downloadCount > 99 ? '99+' : downloadCount}
                </span>
            </button>
        </div>
    )
}
