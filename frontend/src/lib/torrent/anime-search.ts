// Anime-specific torrent search helpers
import { AnimeDetails } from '../types'
import { searchTorrents, searchTorrentsMulti } from './search'

const ANIME_CATEGORY = '208' // Anime category on TPB

/**
 * Generate search queries for an anime
 */
export function generateAnimeQueries(anime: AnimeDetails): string[] {
    const queries: string[] = []

    // Primary: English title (if available)
    if (anime.titleEnglish && anime.titleEnglish !== anime.title) {
        queries.push(anime.titleEnglish)
    }

    // Secondary: Main title (Romaji)
    if (anime.title) {
        queries.push(anime.title)
    }

    // Tertiary: Japanese title
    if (anime.titleJapanese && anime.titleJapanese !== anime.title) {
        queries.push(anime.titleJapanese)
    }

    return queries
}

/**
 * Search torrents for an anime (auto-tries multiple title variations)
 */
export async function searchAnimeTorrents(anime: AnimeDetails) {
    const queries = generateAnimeQueries(anime)
    return await searchTorrentsMulti(queries, ANIME_CATEGORY)
}

/**
 * Search with custom query for an anime
 */
export async function searchAnimeCustom(query: string) {
    return await searchTorrents({ query, category: ANIME_CATEGORY })
}
