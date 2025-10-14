'use client'

import { useState } from 'react'

interface SearchBarProps {
    onSearch: (query: string, category: string) => void
    loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
    const [query, setQuery] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            onSearch(query, '0') // Always search all categories
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for movies, TV shows, games, etc..."
                    className="flex-1 px-6 py-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none text-lg"
                    disabled={loading}
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>
        </form>
    )
}
