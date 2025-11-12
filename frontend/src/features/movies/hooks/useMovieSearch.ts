// Movies Feature - useMovieSearch Hook
'use client'

import { useState } from 'react'
import { moviesService } from '../services/moviesService'
import type { Movie } from '../types'

export function useMovieSearch() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState('')
    const [currentQuery, setCurrentQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)

    const search = async (query: string, page: number = 1, append: boolean = false) => {
        if (!query.trim()) return

        if (append) {
            setLoadingMore(true)
        } else {
            setLoading(true)
        }
        setError('')

        const result = await moviesService.searchMovies(query, page)

        if (result.success) {
            if (append) {
                setMovies((prev) => [...prev, ...result.movies])
            } else {
                setMovies(result.movies)
                setCurrentQuery(query)
            }
            setTotalResults(result.totalResults)
            setCurrentPage(page)
        } else {
            setError(result.error || 'No movies found')
            if (!append) {
                setMovies([])
            }
        }

        setLoading(false)
        setLoadingMore(false)
    }

    const loadMore = () => {
        const nextPage = currentPage + 1
        search(currentQuery, nextPage, true)
    }

    const clear = () => {
        setMovies([])
        setCurrentQuery('')
        setCurrentPage(1)
        setTotalResults(0)
        setError('')
    }

    const totalPages = Math.ceil(totalResults / 10) // OMDB returns 10 results per page
    const hasMore =
        currentPage < totalPages || (movies.length % 10 === 0 && movies.length >= 10)

    return {
        movies,
        loading,
        loadingMore,
        error,
        currentQuery,
        currentPage,
        totalResults,
        totalPages,
        hasMore,
        search,
        loadMore,
        clear,
    }
}
