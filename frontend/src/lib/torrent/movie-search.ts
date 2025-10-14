// Movie-specific torrent search helpers
import { MovieDetails } from '../types'
import { searchTorrents, searchTorrentsMulti } from './search'

/**
 * Generate search queries for a movie
 */
export function generateMovieQueries(movie: MovieDetails): string[] {
    const queries: string[] = []

    // Primary: Title + Year
    queries.push(`${movie.Title} ${movie.Year}`)

    // Alternative: Title only
    queries.push(movie.Title)

    // If title has special characters, try cleaned version
    const cleanTitle = movie.Title.replace(/[^\w\s]/gi, ' ').replace(/\s+/g, ' ').trim()
    if (cleanTitle !== movie.Title) {
        queries.push(`${cleanTitle} ${movie.Year}`)
    }

    return queries
}

/**
 * Search torrents for a movie (auto-tries multiple queries)
 */
export async function searchMovieTorrents(movie: MovieDetails) {
    const queries = generateMovieQueries(movie)
    return await searchTorrentsMulti(queries, '0') // Category 0 = all
}

/**
 * Search with custom query for a movie
 */
export async function searchMovieCustom(query: string) {
    return await searchTorrents({ query, category: '0' })
}
