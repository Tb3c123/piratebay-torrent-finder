import { useEffect, useState } from 'react'

/**
 * Custom hook for sessionStorage caching
 * Automatically saves and restores data on F5 refresh
 *
 * @param cacheKey - Unique key for this cache entry (e.g., 'movie_tt1234567')
 * @param fetchData - Async function to fetch data if not in cache
 * @param onCacheRestore - Optional callback when data is restored from cache
 * @returns { data, loading, error, refetch }
 */
export function useSessionCache<T>(
    cacheKey: string,
    fetchData: () => Promise<T>,
    onCacheRestore?: (data: T) => void
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    const loadData = async () => {
        setLoading(true)
        setError('')

        try {
            // Try to restore from sessionStorage first (for F5 refresh)
            if (typeof window !== 'undefined') {
                const cachedData = sessionStorage.getItem(cacheKey)
                if (cachedData) {
                    console.log(`📦 Restored data from cache: ${cacheKey}`)
                    const parsedData = JSON.parse(cachedData)
                    setData(parsedData)
                    setLoading(false)

                    // Call the callback if provided (e.g., to fetch torrents in background)
                    if (onCacheRestore) {
                        onCacheRestore(parsedData)
                    }
                    return
                }
            }

            // No cache, fetch fresh data
            const result = await fetchData()
            setData(result)

            // Save to cache
            if (typeof window !== 'undefined') {
                sessionStorage.setItem(cacheKey, JSON.stringify(result))
                console.log(`💾 Saved data to cache: ${cacheKey}`)
            }
        } catch (err: any) {
            console.error('Error loading data:', err)
            setError(err.response?.data?.error || err.message || 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [cacheKey])

    const refetch = () => {
        loadData()
    }

    return { data, loading, error, refetch }
}

/**
 * Hook for caching data with manual save
 * Useful when you need more control over when data is cached
 *
 * @param cacheKey - Unique key for this cache entry
 * @returns { getCached, saveToCache, clearCache }
 */
export function useManualCache(cacheKey: string) {
    const getCached = <T>(): T | null => {
        if (typeof window === 'undefined') return null

        const cached = sessionStorage.getItem(cacheKey)
        if (!cached) return null

        try {
            console.log(`📦 Retrieved from cache: ${cacheKey}`)
            return JSON.parse(cached)
        } catch (err) {
            console.error('Error parsing cached data:', err)
            return null
        }
    }

    const saveToCache = <T>(data: T): void => {
        if (typeof window === 'undefined') return

        try {
            sessionStorage.setItem(cacheKey, JSON.stringify(data))
            console.log(`💾 Saved to cache: ${cacheKey}`)
        } catch (err) {
            console.error('Error saving to cache:', err)
        }
    }

    const clearCache = (): void => {
        if (typeof window === 'undefined') return

        sessionStorage.removeItem(cacheKey)
        console.log(`🗑️ Cleared cache: ${cacheKey}`)
    }

    return { getCached, saveToCache, clearCache }
}
