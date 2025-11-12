/**
 * MovieCard Component Tests
 */

import { render, screen } from '@testing-library/react'
import { MovieCard } from '../components/MovieCard'
import type { Movie } from '../types'

describe('MovieCard', () => {
    const mockMovie: Movie = {
        imdbID: 'tt1234567',
        Title: 'Test Movie',
        Year: '2024',
        Type: 'movie',
        Poster: 'https://example.com/poster.jpg',
    }

    it('should render movie information correctly', () => {
        render(<MovieCard movie={mockMovie} />)

        expect(screen.getByText('Test Movie')).toBeInTheDocument()
        expect(screen.getByText('2024')).toBeInTheDocument()
        expect(screen.getByText('movie')).toBeInTheDocument()
    })

    it('should render movie poster', () => {
        render(<MovieCard movie={mockMovie} />)

        const poster = screen.getByAltText('Test Movie')
        expect(poster).toBeInTheDocument()
        expect(poster).toHaveAttribute('src', expect.stringContaining('poster.jpg'))
    })

    it('should render placeholder when no poster', () => {
        const movieWithoutPoster = {
            ...mockMovie,
            Poster: 'N/A',
        }

        render(<MovieCard movie={movieWithoutPoster} />)

        expect(screen.getByText('🎬')).toBeInTheDocument()
    })

    it('should have correct link to movie details', () => {
        render(<MovieCard movie={mockMovie} />)

        const link = screen.getByRole('link')
        expect(link).toHaveAttribute('href', '/movie/tt1234567')
    })

    it('should apply hover effects on card', () => {
        const { container } = render(<MovieCard movie={mockMovie} />)

        const card = container.querySelector('div[class*="hover:scale-105"]')
        expect(card).toBeInTheDocument()
        expect(card).toHaveClass('hover:scale-105')
    })

    it('should render different movie types correctly', () => {
        const seriesMovie = {
            ...mockMovie,
            Type: 'series',
        }

        const { rerender } = render(<MovieCard movie={seriesMovie} />)
        expect(screen.getByText('series')).toBeInTheDocument()

        rerender(<MovieCard movie={mockMovie} />)
        expect(screen.getByText('movie')).toBeInTheDocument()
    })
})
