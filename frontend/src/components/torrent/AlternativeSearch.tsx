// Alternative Title Search Component - Reusable for both movies and anime
'use client'

import { useState } from 'react'

interface AlternativeSearchProps {
    titles: string[]
    onSearch: (query: string) => void
    loading?: boolean
    customSearchEnabled?: boolean
    placeholder?: string
}

export default function AlternativeSearch({
    titles,
    onSearch,
    loading = false,
    customSearchEnabled = true,
    placeholder = 'Enter custom search query...'
}: AlternativeSearchProps) {
    const [customQuery, setCustomQuery] = useState('')
    const [showCustomSearch, setShowCustomSearch] = useState(false)

    const handleCustomSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (customQuery.trim()) {
            onSearch(customQuery.trim())
        }
    }

    const handleTitleSearch = (title: string) => {
        onSearch(title)
    }

    return (
        <div className="space-y-4">
            {/* Alternative Titles */}
            {titles.length > 0 && (
                <div>
                    <h3 className="text-sm text-gray-400 mb-2">
                        Try searching with alternative titles:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {titles.map((title, index) => (
                            <button
                                key={index}
                                onClick={() => handleTitleSearch(title)}
                                disabled={loading}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                🔍 {title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Custom Search */}
            {customSearchEnabled && (
                <div>
                    <button
                        onClick={() => setShowCustomSearch(!showCustomSearch)}
                        className="text-sm text-blue-400 hover:text-blue-300 underline mb-2"
                    >
                        {showCustomSearch ? '▼ Hide' : '▶'} Custom Search
                    </button>

                    {showCustomSearch && (
                        <form onSubmit={handleCustomSearch} className="flex gap-2">
                            <input
                                type="text"
                                value={customQuery}
                                onChange={(e) => setCustomQuery(e.target.value)}
                                placeholder={placeholder}
                                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !customQuery.trim()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Searching...' : '🔍 Search'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
