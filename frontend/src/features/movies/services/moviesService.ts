// Movies Feature - API Service
import axios from 'axios'
import type { Movie, MovieSearchResult } from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Movies Service - All movie-related API calls
 */
export const moviesService = {
    /**
     * Search for movies by query
     */
    searchMovies: async (query: string, page: number = 1): Promise<MovieSearchResult> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/movies/search`, {
                params: { query, page },
            })

            // Backend returns: { success: true, data: { success: true, movies: [...] } }
            const movieData = response.data.data || response.data
            const movies = movieData.movies || []

            if (response.data.success && movies.length > 0) {
                return {
                    movies,
                    totalResults: movieData.totalResults || movies.length,
                    success: true,
                }
            } else {
                return {
                    movies: [],
                    totalResults: 0,
                    success: false,
                    error: movieData.error || 'No movies found',
                }
            }
        } catch (error: any) {
            console.error('Failed to search movies:', error)
            return {
                movies: [],
                totalResults: 0,
                success: false,
                error: error.response?.data?.error || 'Failed to search movies',
            }
        }
    },

    /**
     * Get trending movies
     */
    getTrendingMovies: async (): Promise<Movie[]> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/movies/trending/now`)
            const movieData = response.data.data || response.data
            return movieData.movies || []
        } catch (error) {
            console.error('Failed to load trending movies:', error)
            return []
        }
    },

    /**
     * Get popular movies
     */
    getPopularMovies: async (): Promise<Movie[]> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/movies/trending/popular`)
            const movieData = response.data.data || response.data
            return movieData.movies || []
        } catch (error) {
            console.error('Failed to load popular movies:', error)
            return []
        }
    },

    /**
     * Get latest movies
     */
    getLatestMovies: async (): Promise<Movie[]> => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/movies/latest`)
            const movieData = response.data.data || response.data
            return movieData.movies || []
        } catch (error) {
            console.error('Failed to load latest movies:', error)
            return []
        }
    },
}
