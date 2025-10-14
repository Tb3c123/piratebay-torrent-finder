/**
 * HistoryItem Component
 * Individual search history item with click handler and badge
 */

import { SearchHistoryItem } from './types'
import { formatDate } from './utils'

interface HistoryItemProps {
    item: SearchHistoryItem
    onClick: (item: SearchHistoryItem) => void
    compact?: boolean
}

export default function HistoryItem({ item, onClick, compact = false }: HistoryItemProps) {
    return (
        <button
            onClick={() => onClick(item)}
            className={`w-full text-left ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors`}
        >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
                <div className="flex-1 min-w-0">
                    <p className={`text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-medium ${compact ? 'truncate' : 'break-words'} mb-1`}>
                        {item.query}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                        {formatDate(item.timestamp)}
                    </p>
                    {!compact && item.resultCount !== undefined && (
                        <p className="text-gray-500 text-xs mt-1">
                            {item.resultCount} results
                        </p>
                    )}
                </div>
                {item.category === 'piratebay' ? (
                    <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        🏴‍☠️ {!compact && 'Pirate'}
                    </span>
                ) : item.type === 'movie' ? (
                    <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        🎥 {!compact && 'Movie'}
                    </span>
                ) : item.type === 'anime' ? (
                    <span className="text-xs bg-pink-900 text-pink-200 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        ⭐ {!compact && 'Anime'}
                    </span>
                ) : null}
            </div>
        </button>
    )
}
