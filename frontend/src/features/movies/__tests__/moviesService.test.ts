/**
 * Movies Service Tests
 * Tests for movies API service layer
 */

import { moviesService } from '../services/moviesService'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('moviesService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('searchMovies', () => {
        it('should search movies successfully', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        movies: [
                            {
                                imdbID: 'tt1234567',
                                Title: 'Test Movie',
                                Year: '2024',
                                Type: 'movie',
                                Poster: 'https://example.com/poster.jpg',
                            },
                        ],
                        totalResults: 1,
                    },
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            const result = await moviesService.searchMovies('Test', 1)

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/movies/search'),
                expect.objectContaining({
                    params: { query: 'Test', page: 1 },
                })
            )
            expect(result.success).toBe(true)
            expect(result.movies).toHaveLength(1)
            expect(result.totalResults).toBe(1)
        })

        it('should handle search errors', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

            const result = await moviesService.searchMovies('Test', 1)

            expect(result.success).toBe(false)
            expect(result.movies).toHaveLength(0)
        })

        it('should use default page if not provided', async () => {
            const mockResponse = {
                data: {
                    success: true,
                    data: {
                        movies: [],
                        totalResults: 0,
                    },
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            await moviesService.searchMovies('Test')

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    params: { query: 'Test', page: 1 },
                })
            )
        })

        it('should handle no movies found', async () => {
            const mockResponse = {
                data: {
                    success: false,
                    error: 'No movies found',
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            const result = await moviesService.searchMovies('NonExistent')

            expect(result.success).toBe(false)
            expect(result.error).toBe('No movies found')
        })
    })

    describe('getTrendingMovies', () => {
        it('should fetch trending movies successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        movies: [
                            { imdbID: 'tt1', Title: 'Movie 1', Year: '2024' },
                            { imdbID: 'tt2', Title: 'Movie 2', Year: '2024' },
                        ],
                    },
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            const result = await moviesService.getTrendingMovies()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/movies/trending/now')
            )
            expect(result).toHaveLength(2)
        })

        it('should handle errors gracefully', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

            const result = await moviesService.getTrendingMovies()

            expect(result).toEqual([])
        })
    })

    describe('getPopularMovies', () => {
        it('should fetch popular movies successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        movies: [
                            { imdbID: 'tt3', Title: 'Popular Movie 1' },
                            { imdbID: 'tt4', Title: 'Popular Movie 2' },
                        ],
                    },
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            const result = await moviesService.getPopularMovies()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/movies/trending/popular')
            )
            expect(result).toHaveLength(2)
        })
    })

    describe('getLatestMovies', () => {
        it('should fetch latest movies successfully', async () => {
            const mockResponse = {
                data: {
                    data: {
                        movies: [
                            { imdbID: 'tt5', Title: 'Latest Movie 1' },
                        ],
                    },
                },
            }

            mockedAxios.get.mockResolvedValueOnce(mockResponse)

            const result = await moviesService.getLatestMovies()

            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/movies/latest')
            )
            expect(result).toHaveLength(1)
        })
    })
})
