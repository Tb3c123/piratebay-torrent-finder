/**
 * BurgerMenu Component
 * Main navigation menu with search history and system navigation
 *
 * Features:
 * - Two views: Main (recent history + navigation) and Full History (all history with infinite scroll)
 * - Persistent across page navigation
 * - Responsive design with flexible layout
 * - Auto-adjusts content height to prevent overflow
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

// Local imports
import { SearchHistoryItem, MenuView } from './BurgerMenu/types'
import { API_URL, ITEMS_PER_PAGE, INFINITE_SCROLL_THRESHOLD } from './BurgerMenu/constants'
import MainView from './BurgerMenu/MainView'
import FullHistoryView from './BurgerMenu/FullHistoryView'

export default function BurgerMenu() {
    // UI State
    const [isOpen, setIsOpen] = useState(false)
    const [currentView, setCurrentView] = useState<MenuView>('main')

    // History State
    const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Infinite Scroll State (Full History View)
    const [displayedHistory, setDisplayedHistory] = useState<SearchHistoryItem[]>([])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const observerTarget = useRef<HTMLDivElement>(null)

    const router = useRouter()

    // ========== Effects ==========

    // Load history when menu opens, reset when closes
    useEffect(() => {
        if (isOpen) {
            loadSearchHistory()
        } else {
            resetToMainView()
        }
    }, [isOpen])

    // Initialize displayed history for full history view
    useEffect(() => {
        if (currentView === 'fullHistory' && searchHistory.length > 0) {
            const firstPage = searchHistory.slice(0, ITEMS_PER_PAGE)
            setDisplayedHistory(firstPage)
            setPage(1)
            setHasMore(searchHistory.length > ITEMS_PER_PAGE)
        }
    }, [currentView, searchHistory])

    // Infinite scroll observer
    useEffect(() => {
        if (currentView !== 'fullHistory') return

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMore) {
                    loadMoreItems()
                }
            },
            { threshold: INFINITE_SCROLL_THRESHOLD }
        )

        if (observerTarget.current) {
            observer.observe(observerTarget.current)
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current)
            }
        }
    }, [currentView, hasMore, loadingMore, page])

    // ========== API Functions ==========

    const loadSearchHistory = async () => {
        setLoadingHistory(true)
        try {
            const response = await axios.get(`${API_URL}/api/history`)
            setSearchHistory(response.data)
        } catch (error) {
            console.error('Failed to load search history:', error)
        } finally {
            setLoadingHistory(false)
        }
    }

    const clearHistory = async () => {
        if (!confirm('Clear all search history?')) return

        try {
            await axios.delete(`${API_URL}/api/history`)
            setSearchHistory([])
            setDisplayedHistory([])
        } catch (error) {
            console.error('Failed to clear history:', error)
        }
    }

    // ========== Infinite Scroll ==========

    const loadMoreItems = useCallback(() => {
        if (loadingMore || !hasMore) return

        setLoadingMore(true)

        setTimeout(() => {
            const nextPage = page + 1
            const startIndex = page * ITEMS_PER_PAGE
            const endIndex = startIndex + ITEMS_PER_PAGE
            const nextItems = searchHistory.slice(startIndex, endIndex)

            if (nextItems.length > 0) {
                setDisplayedHistory(prev => [...prev, ...nextItems])
                setPage(nextPage)
                setHasMore(endIndex < searchHistory.length)
            } else {
                setHasMore(false)
            }

            setLoadingMore(false)
        }, 300)
    }, [page, searchHistory, loadingMore, hasMore])

    // ========== Navigation Functions ==========

    const handleSearchFromHistory = (item: SearchHistoryItem) => {
        setIsOpen(false)

        if (item.category === 'piratebay') {
            router.push(`/torrent/search?q=${encodeURIComponent(item.query)}`)
        } else {
            router.push(`/?search=${encodeURIComponent(item.query)}`)
        }
    }

    const navigateToLogs = () => {
        setIsOpen(false)
        router.push('/logs')
    }

    const navigateToSettings = () => {
        setIsOpen(false)
        router.push('/settings')
    }

    const showFullHistory = () => {
        setCurrentView('fullHistory')
    }

    const resetToMainView = () => {
        setCurrentView('main')
        setPage(1)
        setDisplayedHistory([])
        setHasMore(true)
    }

    // ========== Render ==========

    return (
        <>
            {/* Burger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-3 left-4 z-[10000] p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span className="block h-0.5 bg-white"></span>
                    <span className="block h-0.5 bg-white"></span>
                    <span className="block h-0.5 bg-white"></span>
                </div>
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[9998] cursor-pointer"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Menu */}
            <div
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-gray-900 shadow-2xl z-[9999] transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Menu</h2>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                    {currentView === 'main' ? (
                        <MainView
                            searchHistory={searchHistory}
                            loadingHistory={loadingHistory}
                            onSearchFromHistory={handleSearchFromHistory}
                            onClearHistory={clearHistory}
                            onShowFullHistory={showFullHistory}
                            onNavigateToLogs={navigateToLogs}
                            onNavigateToSettings={navigateToSettings}
                        />
                    ) : (
                        <FullHistoryView
                            searchHistory={searchHistory}
                            displayedHistory={displayedHistory}
                            loadingHistory={loadingHistory}
                            loadingMore={loadingMore}
                            hasMore={hasMore}
                            observerTarget={observerTarget}
                            onBack={resetToMainView}
                            onClearHistory={clearHistory}
                            onSearchFromHistory={handleSearchFromHistory}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 bg-gray-900 flex-shrink-0">
                    <p className="text-gray-500 text-xs text-center">
                        Pirate Bay Torrent Finder v1.0
                    </p>
                </div>
            </div>
        </>
    )
}
