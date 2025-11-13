'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Header() {
    const router = useRouter()
    const { user, isAuthenticated, logout } = useAuth()
    const [downloadCount, setDownloadCount] = useState(0)
    const [showAccountMenu, setShowAccountMenu] = useState(false)

    const handleLogoClick = () => {
        router.push('/')
    }

    const handleDownloadsClick = () => {
        router.push('/downloads')
    }

    const handleAccountClick = () => {
        if (!isAuthenticated) {
            router.push('/auth/login')
        } else {
            setShowAccountMenu(!showAccountMenu)
        }
    }

    const handleLogout = async () => {
        await logout()
        setShowAccountMenu(false)
        router.push('/auth/login')
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.account-menu-container')) {
                setShowAccountMenu(false)
            }
        }

        if (showAccountMenu) {
            document.addEventListener('click', handleClickOutside)
        }

        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [showAccountMenu])

    // Fetch download count
    useEffect(() => {
        const fetchDownloadCount = async () => {
            if (!user?.id) return; // Don't fetch if no user

            try {
                const response = await axios.get(`${API_URL}/api/v1/qbittorrent/torrents`, {
                    params: { userId: user.id }
                })
                // Updated to match standardized API response format
                const torrents = response.data.data?.torrents || []
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
    }, [user?.id])

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

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
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

                {/* Account Button */}
                <div className="relative account-menu-container">
                    <button
                        onClick={handleAccountClick}
                        className="relative p-2 hover:bg-gray-800 rounded-lg transition-all group"
                        title={isAuthenticated ? user?.username : "Login"}
                    >
                        {/* User Icon - Outline Style */}
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>

                        {/* Admin Badge */}
                        {isAuthenticated && user?.is_admin && (
                            <span className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                A
                            </span>
                        )}
                    </button>

                    {/* Account Dropdown Menu */}
                    {showAccountMenu && isAuthenticated && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-50">
                            {/* User Info */}
                            <div className="px-4 py-3 bg-gray-900 border-b border-gray-700">
                                <p className="text-sm text-gray-400">Signed in as</p>
                                <p className="text-white font-semibold flex items-center gap-2">
                                    {user?.username}
                                    {user?.is_admin && (
                                        <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                                            Admin
                                        </span>
                                    )}
                                </p>
                            </div>

                            {/* Menu Items */}
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        router.push('/settings')
                                        setShowAccountMenu(false)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Settings
                                </button>

                                {user?.is_admin && (
                                    <button
                                        onClick={() => {
                                            router.push('/admin')
                                            setShowAccountMenu(false)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Admin Panel
                                    </button>
                                )}

                                <hr className="border-gray-700 my-1" />

                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
