// Movies Feature - MovieSearchBar Component
'use client'

import { useState, FormEvent } from 'react'

interface MovieSearchBarProps {
    onSearch: (query: string) => void
    loading?: boolean
    placeholder?: string
    initialQuery?: string
}

export function MovieSearchBar({
    onSearch,
    loading = false,
    placeholder = 'Search for movies (e.g., Inception, Avengers, Batman)...',
    initialQuery = '',
}: MovieSearchBarProps) {
    const [query, setQuery] = useState(initialQuery)

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query.trim())
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mb-8">
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
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </form>
    )
}
