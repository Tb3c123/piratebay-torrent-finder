const axios = require('axios');

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Cache for anime data
const animeCache = new Map();
const searchCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Search anime on MyAnimeList via Jikan API
 * @param {string} query - Search query
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search results
 */
async function searchAnime(query, page = 1) {
    const cacheKey = `search:${query}:${page}`;

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SEARCH_CACHE_TTL) {
        console.log(`✓ Cache hit for anime search: ${query}`);
        return cached.data;
    }

    try {
        // Jikan has rate limiting: 3 requests/second, 60 requests/minute
        await rateLimitDelay();

        const response = await axios.get(`${JIKAN_BASE_URL}/anime`, {
            params: {
                q: query,
                page: page,
                limit: 25,
                order_by: 'score',
                sort: 'desc'
            },
            timeout: 10000
        });

        const anime = response.data.data.map(item => ({
            malId: item.mal_id,
            title: item.title,
            titleEnglish: item.title_english,
            titleJapanese: item.title_japanese,
            type: item.type, // TV, Movie, OVA, Special, ONA, Music
            episodes: item.episodes,
            status: item.status,
            aired: item.aired?.string,
            score: item.score,
            scoredBy: item.scored_by,
            rank: item.rank,
            popularity: item.popularity,
            synopsis: item.synopsis,
            image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
            trailer: item.trailer?.url,
            genres: item.genres?.map(g => g.name),
            studios: item.studios?.map(s => s.name),
            year: item.year,
            rating: item.rating // G, PG, PG-13, R, R+, Rx
        }));

        const result = {
            success: true,
            anime: anime,
            total: response.data.pagination?.items?.total || anime.length,
            hasNextPage: response.data.pagination?.has_next_page || false,
            currentPage: page
        };

        // Store in cache
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        console.error('Jikan API search error:', error.message);

        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a moment.');
        }

        throw new Error('Failed to search anime: ' + error.message);
    }
}

/**
 * Get anime details by MAL ID
 * @param {number} malId - MyAnimeList ID
 * @returns {Promise<Object>} Anime details
 */
async function getAnimeDetails(malId) {
    const cacheKey = `anime:${malId}`;

    // Check cache
    const cached = animeCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`✓ Cache hit for anime ${malId}`);
        return cached.data;
    }

    try {
        await rateLimitDelay();

        // Retry logic for network issues
        let lastError;
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await axios.get(`${JIKAN_BASE_URL}/anime/${malId}/full`, {
                    timeout: 15000 // Increased from 10s to 15s
                });

                if (!response.data || !response.data.data) {
                    throw new Error('Invalid API response structure');
                }

                const item = response.data.data;

                const result = {
                    success: true,
                    malId: item.mal_id,
                    title: item.title,
                    titleEnglish: item.title_english,
                    titleJapanese: item.title_japanese,
                    titleSynonyms: item.title_synonyms,
                    type: item.type,
                    source: item.source, // Manga, Light novel, Original, etc.
                    episodes: item.episodes,
                    status: item.status,
                    airing: item.airing,
                    aired: {
                        from: item.aired?.from,
                        to: item.aired?.to,
                        string: item.aired?.string
                    },
                    duration: item.duration,
                    rating: item.rating,
                    score: item.score,
                    scoredBy: item.scored_by,
                    rank: item.rank,
                    popularity: item.popularity,
                    members: item.members,
                    favorites: item.favorites,
                    synopsis: item.synopsis,
                    background: item.background,
                    season: item.season,
                    year: item.year,
                    broadcast: item.broadcast?.string,
                    producers: item.producers?.map(p => ({ id: p.mal_id, name: p.name })) || [],
                    licensors: item.licensors?.map(l => ({ id: l.mal_id, name: l.name })) || [],
                    studios: item.studios?.map(s => ({ id: s.mal_id, name: s.name })) || [],
                    genres: item.genres?.map(g => ({ id: g.mal_id, name: g.name })) || [],
                    themes: item.themes?.map(t => ({ id: t.mal_id, name: t.name })) || [],
                    demographics: item.demographics?.map(d => ({ id: d.mal_id, name: d.name })) || [],
                    // Provide both image (for compatibility) and images (for detailed access)
                    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
                    images: {
                        jpg: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
                        webp: item.images?.webp?.large_image_url || item.images?.webp?.image_url
                    },
                    trailer: {
                        youtube_id: item.trailer?.youtube_id,
                        url: item.trailer?.url,
                        embed_url: item.trailer?.embed_url
                    },
                    streaming: item.streaming?.map(s => ({ name: s.name, url: s.url })) || [],
                    relations: item.relations?.map(r => ({
                        relation: r.relation,
                        entries: r.entry?.map(e => ({ mal_id: e.mal_id, type: e.type, name: e.name })) || []
                    })) || [],
                    external: item.external?.map(e => ({ name: e.name, url: e.url })) || []
                };

                // Store in cache
                animeCache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });

                return result;
            } catch (attemptError) {
                lastError = attemptError;
                console.log(`Attempt ${attempt}/3 failed for anime ${malId}: ${attemptError.code || attemptError.message}`);

                // Don't retry on 404 or 429
                if (attemptError.response?.status === 404 || attemptError.response?.status === 429) {
                    throw attemptError;
                }

                // Wait before retry (except last attempt)
                if (attempt < 3) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // If all retries failed, throw the last error
        throw lastError;
    } catch (error) {
        console.error('Jikan API details error:', error);
        console.error('Error stack:', error.stack);

        if (error.response?.status === 404) {
            return {
                success: false,
                error: 'Anime not found'
            };
        }

        if (error.response?.status === 429) {
            throw new Error('Rate limit exceeded. Please try again in a moment.');
        }

        // Provide more detailed error message
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        throw new Error('Failed to get anime details: ' + errorMsg);
    }
}

/**
 * Get top anime by various filters
 * @param {string} type - tv, movie, ova, special, ona, music
 * @param {string} filter - airing, upcoming, bypopularity, favorite
 * @param {number} page - Page number
 * @returns {Promise<Object>} Top anime list
 */
async function getTopAnime(type = null, filter = null, page = 1) {
    const cacheKey = `top:${type}:${filter}:${page}`;

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`✓ Cache hit for top anime: ${type}/${filter}`);
        return cached.data;
    }

    try {
        await rateLimitDelay();

        const params = {
            page: page,
            limit: 25
        };

        if (type) params.type = type;
        if (filter) params.filter = filter;

        const response = await axios.get(`${JIKAN_BASE_URL}/top/anime`, {
            params,
            timeout: 10000
        });

        const anime = response.data.data.map(item => ({
            malId: item.mal_id,
            title: item.title,
            titleEnglish: item.title_english,
            titleJapanese: item.title_japanese,
            type: item.type,
            episodes: item.episodes,
            status: item.status,
            aired: item.aired?.string,
            score: item.score,
            rank: item.rank,
            popularity: item.popularity,
            synopsis: item.synopsis,
            image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
            genres: item.genres?.map(g => g.name),
            year: item.year
        }));

        const result = {
            success: true,
            anime: anime,
            total: response.data.pagination?.items?.total || anime.length,
            hasNextPage: response.data.pagination?.has_next_page || false,
            currentPage: page
        };

        // Store in cache
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        console.error('Jikan API top anime error:', error.message);
        throw new Error('Failed to get top anime: ' + error.message);
    }
}

/**
 * Get seasonal anime (current season)
 * @param {number} year - Year (e.g., 2025)
 * @param {string} season - winter, spring, summer, fall
 * @returns {Promise<Object>} Seasonal anime
 */
async function getSeasonalAnime(year = null, season = null) {
    const cacheKey = year && season ? `season:${year}:${season}` : 'season:now';

    // Check cache
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`✓ Cache hit for seasonal anime: ${year}/${season}`);
        return cached.data;
    }

    try {
        await rateLimitDelay();

        const url = year && season
            ? `${JIKAN_BASE_URL}/seasons/${year}/${season}`
            : `${JIKAN_BASE_URL}/seasons/now`;

        const response = await axios.get(url, {
            timeout: 10000
        });

        const anime = response.data.data.map(item => ({
            malId: item.mal_id,
            title: item.title,
            titleEnglish: item.title_english,
            type: item.type,
            episodes: item.episodes,
            score: item.score,
            synopsis: item.synopsis,
            image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url,
            genres: item.genres?.map(g => g.name),
            studios: item.studios?.map(s => s.name),
            year: item.year,
            season: item.season
        }));

        const result = {
            success: true,
            anime: anime,
            season: response.data.season,
            year: response.data.year
        };

        // Store in cache
        searchCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
        });

        return result;
    } catch (error) {
        console.error('Jikan API seasonal error:', error.message);
        throw new Error('Failed to get seasonal anime: ' + error.message);
    }
}

// Rate limiting: 3 requests/second, 60 requests/minute
let lastRequestTime = 0;
const MIN_DELAY = 350; // ~3 requests per second

async function rateLimitDelay() {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_DELAY) {
        await new Promise(resolve => setTimeout(resolve, MIN_DELAY - timeSinceLastRequest));
    }

    lastRequestTime = Date.now();
}

/**
 * Clear anime search cache
 */
function clearCache() {
    const size = searchCache.size;
    searchCache.clear();
    console.log(`✓ Cleared Jikan search cache (${size} entries)`);
}

/**
 * Clear anime details cache
 */
function clearAnimeCache() {
    const size = animeCache.size;
    animeCache.clear();
    console.log(`✓ Cleared Jikan anime cache (${size} entries)`);
}

/**
 * Get cache statistics for search cache
 */
function getCacheStats() {
    return {
        size: searchCache.size,
        ttl: `${SEARCH_CACHE_TTL / 1000 / 60} minutes`
    };
}

/**
 * Get cache statistics for anime cache
 */
function getAnimeCacheStats() {
    return {
        size: animeCache.size,
        ttl: `${CACHE_TTL / 1000 / 60} minutes`
    };
}

module.exports = {
    searchAnime,
    getAnimeDetails,
    getTopAnime,
    getSeasonalAnime,
    clearCache,
    clearAnimeCache,
    getCacheStats,
    getAnimeCacheStats
};
