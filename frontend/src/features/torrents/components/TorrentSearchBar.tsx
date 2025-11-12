// Torrents Feature - TorrentSearchBar Component
'use client'

import { useState, FormEvent } from 'react'
import CategoryFilterComponent from '@/components/CategoryFilter'

interface TorrentSearchBarProps {
    onSearch: (query: string, category: string) => void
    loading?: boolean
    placeholder?: string
    initialQuery?: string
    selectedCategory?: string
    onCategoryChange?: (category: string) => void
}

export function TorrentSearchBar({
    onSearch,
    loading = false,
    placeholder = 'Search for torrents...',
    initialQuery = '',
    selectedCategory = '0',
    onCategoryChange,
}: TorrentSearchBarProps) {
    const [query, setQuery] = useState(initialQuery)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query.trim(), selectedCategory)
        }
    }

    const handleCategoryChange = (category: string) => {
        if (onCategoryChange) {
            onCategoryChange(category)
        }
    }

    return (
        <div className="space-y-4 mb-8">
            {/* Search Form */}
            <form onSubmit={handleSubmit}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading || !query.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>
                </div>
            </form>

            {/* Category Filter */}
            {onCategoryChange && (
                <CategoryFilterComponent
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            )}
        </div>
    )
}
