// Movies Feature - useMovieSections Hook
'use client'

import { useState, useEffect } from 'react'
import { moviesService } from '../services/moviesService'
import type { Movie } from '../types'

export function useMovieSections() {
    const [trending, setTrending] = useState<Movie[]>([])
    const [popular, setPopular] = useState<Movie[]>([])
    const [latest, setLatest] = useState<Movie[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSections()
    }, [])

    const loadSections = async () => {
        setLoading(true)

        const [trendingMovies, popularMovies, latestMovies] = await Promise.all([
            moviesService.getTrendingMovies(),
            moviesService.getPopularMovies(),
            moviesService.getLatestMovies(),
        ])

        // Validate and filter out invalid movie data
        const validateMovies = (movies: Movie[]) => {
            return movies.filter(
                (m) => m && m.imdbID && m.Title && m.Poster && m.Poster !== 'N/A'
            )
        }

        setTrending(validateMovies(trendingMovies))
        setPopular(validateMovies(popularMovies))
        setLatest(validateMovies(latestMovies))
        setLoading(false)
    }

    return {
        trending,
        popular,
        latest,
        loading,
        refresh: loadSections,
    }
}
