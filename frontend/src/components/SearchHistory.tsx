'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SearchHistory {
    id: number
    query: string
    timestamp: number
    category: string
}

interface SearchHistoryProps {
    onSearchFromHistory: (query: string, category: string) => void
}

export default function SearchHistory({ onSearchFromHistory }: SearchHistoryProps) {
    const [history, setHistory] = useState<SearchHistory[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        loadHistory()
        loadStats()
    }, [])

    const loadHistory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/history`)
            setHistory(response.data)
        } catch (error) {
            console.error('Failed to load search history:', error)
        }
    }

    const loadStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/history/stats`)
            setStats(response.data)
        } catch (error) {
            console.error('Failed to load history stats:', error)
        }
    }

    const addToHistory = async (query: string, category: string) => {
        try {
            const response = await axios.post(`${API_URL}/api/history`, {
                query,
                category
            })
            setHistory(response.data.history)
        } catch (error) {
            console.error('Failed to add to search history:', error)
        }
    }

    const clearHistory = async () => {
        if (confirm('Are you sure you want to clear all search history?')) {
            try {
                await axios.delete(`${API_URL}/api/history`)
                setHistory([])
            } catch (error) {
                console.error('Failed to clear search history:', error)
            }
        }
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp)
        const now = Date.now()
        const diff = now - timestamp

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return date.toLocaleDateString()
    }

    // Expose addToHistory to parent
    useEffect(() => {
        (window as any).addSearchToHistory = addToHistory
    }, [])

    if (history.length === 0) return null

    return (
        <div className="max-w-3xl mx-auto mt-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <span>📜</span>
                <span>Search History ({history.length})</span>
                <span>{isOpen ? '▼' : '▶'}</span>
            </button>

            {isOpen && (
                <div className="mt-4 bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <h3 className="text-white font-semibold">Recent Searches (Shared across all browsers)</h3>
                            {stats && (
                                <p className="text-xs text-gray-400 mt-1">
                                    📊 {stats.total} searches • 🕒 Auto-cleanup: &gt;{stats.retention_days} days •
                                    🗑️ {stats.old_entries_count} ready to clean
                                </p>
                            )}
                        </div>
                        <button
                            onClick={clearHistory}
                            className="text-red-400 hover:text-red-300 text-sm"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-2">
                        {history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onSearchFromHistory(item.query, item.category)
                                    setIsOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors flex justify-between items-center"
                            >
                                <span className="text-white">{item.query}</span>
                                <span className="text-gray-400 text-sm">{formatDate(item.timestamp)}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
