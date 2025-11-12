// Downloads Feature - useDownloads Hook
'use client'

import { useState, useEffect } from 'react'
import { downloadsService } from '../services/downloadsService'
import type { Torrent } from '../types'

export function useDownloads(userId?: number, autoRefreshInterval: number = 3000) {
    const [torrents, setTorrents] = useState<Torrent[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [autoRefresh, setAutoRefresh] = useState(true)

    useEffect(() => {
        loadTorrents()

        // Auto-refresh if enabled
        if (autoRefresh && autoRefreshInterval > 0) {
            const interval = setInterval(loadTorrents, autoRefreshInterval)
            return () => clearInterval(interval)
        }
    }, [autoRefresh, autoRefreshInterval, userId])

    const loadTorrents = async () => {
        const { torrents: data, error: err } = await downloadsService.getTorrents(userId)

        setTorrents(data)
        setError(err || null)
        setLoading(false)
    }

    const toggleAutoRefresh = () => {
        setAutoRefresh((prev) => !prev)
    }

    const refresh = () => {
        loadTorrents()
    }

    return {
        torrents,
        loading,
        error,
        autoRefresh,
        toggleAutoRefresh,
        refresh,
    }
}
