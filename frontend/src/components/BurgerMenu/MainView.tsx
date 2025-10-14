/**
 * MainView Component
 * Main menu view with recent history, system logs, and settings
 */

'use client'

import { SearchHistoryItem } from './types'
import { RECENT_HISTORY_LIMIT } from './constants'
import HistoryItem from './HistoryItem'

interface MainViewProps {
    searchHistory: SearchHistoryItem[]
    loadingHistory: boolean
    onSearchFromHistory: (item: SearchHistoryItem) => void
    onClearHistory: () => void
    onShowFullHistory: () => void
    onNavigateToLogs: () => void
}

export default function MainView({
    searchHistory,
    loadingHistory,
    onSearchFromHistory,
    onClearHistory,
    onShowFullHistory,
    onNavigateToLogs
}: MainViewProps) {
    const recentHistory = searchHistory.slice(0, RECENT_HISTORY_LIMIT)

    return (
        <>
            {/* Search History Section - FLEXIBLE: takes available space */}
            <div className="flex-1 flex flex-col border-b border-gray-700 min-h-0">
                <div className="p-4 sm:p-6 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
                            <span>🔍</span> Search History
                        </h3>
                        {searchHistory.length > 0 && (
                            <button
                                onClick={onClearHistory}
                                className="text-xs text-red-400 hover:text-red-300"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {loadingHistory ? (
                        <div className="text-center py-4">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : searchHistory.length === 0 ? (
                        <p className="text-gray-500 text-sm">No search history yet</p>
                    ) : null}
                </div>

                {/* History Items - Flexible height, scrollable */}
                {!loadingHistory && searchHistory.length > 0 && (
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 min-h-0">
                        <div className="space-y-2">
                            {recentHistory.map((item, index) => (
                                <HistoryItem
                                    key={`recent-${index}`}
                                    item={item}
                                    onClick={onSearchFromHistory}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* More Button - Fixed at bottom of history section */}
                {!loadingHistory && searchHistory.length > 0 && (
                    <div className="px-4 sm:px-6 pb-4 flex-shrink-0">
                        <button
                            onClick={onShowFullHistory}
                            className="w-full px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <span>View Full History</span>
                            {searchHistory.length > RECENT_HISTORY_LIMIT && (
                                <span className="text-blue-200">({searchHistory.length})</span>
                            )}
                            <span>→</span>
                        </button>
                    </div>
                )}
            </div>

            {/* System Logs Section - Flexible */}
            <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
                <button
                    onClick={onNavigateToLogs}
                    className="w-full p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-xl sm:text-2xl">📋</span>
                        <div className="text-left">
                            <p className="text-white text-sm sm:text-base font-semibold">System Logs</p>
                            <p className="text-gray-400 text-xs">View application logs</p>
                        </div>
                    </div>
                    <span className="text-gray-400">→</span>
                </button>
            </div>

            {/* Placeholder Features - Flexible */}
            <div className="p-4 sm:p-6 flex-shrink-0">
                <div className="space-y-2">
                    <button
                        disabled
                        className="w-full text-left p-2 sm:p-3 bg-gray-800 text-gray-500 rounded-lg cursor-not-allowed opacity-50"
                    >
                        <span className="flex items-center gap-2 text-xs sm:text-sm">
                            <span>⚙️</span> Settings (Coming Soon)
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}
