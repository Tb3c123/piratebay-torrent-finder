/**
 * FullHistoryView Component
 * Full history list with infinite scroll and date grouping
 */

'use client'

import { RefObject } from 'react'
import { SearchHistoryItem } from './types'
import { groupByDate, formatTime } from './utils'

interface FullHistoryViewProps {
    searchHistory: SearchHistoryItem[]
    displayedHistory: SearchHistoryItem[]
    loadingHistory: boolean
    loadingMore: boolean
    hasMore: boolean
    observerTarget: RefObject<HTMLDivElement>
    onBack: () => void
    onClearHistory: () => void
    onSearchFromHistory: (item: SearchHistoryItem) => void
}

export default function FullHistoryView({
    searchHistory,
    displayedHistory,
    loadingHistory,
    loadingMore,
    hasMore,
    observerTarget,
    onBack,
    onClearHistory,
    onSearchFromHistory
}: FullHistoryViewProps) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Header with Back Button */}
            <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                    >
                        ← Back
                    </button>
                    <h3 className="text-base sm:text-lg font-semibold text-white flex-1">
                        Full History
                    </h3>
                    {searchHistory.length > 0 && (
                        <button
                            onClick={onClearHistory}
                            className="text-xs text-red-400 hover:text-red-300 whitespace-nowrap"
                        >
                            Clear All
                        </button>
                    )}
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                    {searchHistory.length} total searches
                </p>
            </div>

            {/* Scrollable History List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-0">
                {loadingHistory ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : searchHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No search history yet</p>
                ) : (
                    <div className="space-y-4 sm:space-y-6">
                        {Object.entries(groupByDate(displayedHistory)).map(([date, items]) => (
                            <div key={date}>
                                <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 py-2">
                                    {date}
                                </h4>
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <button
                                            key={`${date}-${index}`}
                                            onClick={() => onSearchFromHistory(item)}
                                            className="w-full text-left p-3 sm:p-4 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-2 sm:gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm sm:text-base font-medium mb-1 break-words">
                                                        {item.query}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                                                        <span>{formatTime(item.timestamp)}</span>
                                                        {item.resultCount !== undefined && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{item.resultCount} results</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.category === 'piratebay' ? (
                                                    <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                                                        🏴‍☠️ Pirate
                                                    </span>
                                                ) : item.type === 'movie' ? (
                                                    <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                                                        🎥 Movie
                                                    </span>
                                                ) : null}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Infinite Scroll Trigger */}
                        <div ref={observerTarget} className="py-6 sm:py-8 text-center">
                            {loadingMore && (
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                            )}
                            {!hasMore && displayedHistory.length > 0 && (
                                <p className="text-gray-500 text-xs sm:text-sm">No more history</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
