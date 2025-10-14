const axios = require('axios');

const OMDB_API_KEY = process.env.OMDB_API_KEY || 'b9a5144d'; // Free API key
const OMDB_BASE_URL = 'http://www.omdbapi.com/';

// Popular search keywords for random movie discovery (English - default)
const SEARCH_KEYWORDS = {
    'en': [
        'love', 'war', 'time', 'life', 'man', 'night', 'day', 'death', 'house',
        'world', 'last', 'new', 'dark', 'light', 'lost', 'blood', 'dead', 'shadow',
        'american', 'fight', 'story', 'tale', 'secret', 'king', 'queen', 'city',
        'black', 'white', 'red', 'blue', 'star', 'space', 'dragon', 'girl', 'boy'
    ],
    'vi': [
        'em', 'anh', 'người', 'tình', 'đời', 'đêm', 'ngày', 'nhà', 'con',
        'yêu', 'chiến', 'cuộc', 'mẹ', 'cha', 'thế', 'giới', 'làng', 'phố',
        'cô', 'chàng', 'cậu', 'nàng', 'quê', 'hương', 'duyên', 'mộng'
    ],
    'zh': [
        '爱', '战', '时', '人', '夜', '天', '家', '世', '界', '城',
        '王', '后', '红', '黑', '白', '龙', '凤', '英', '雄', '故',
        '事', '传', '说', '秘', '密', '生', '死', '梦', '情'
    ],
    'ko': [
        '사랑', '전쟁', '시간', '인생', '밤', '날', '집', '세계', '도시',
        '왕', '여왕', '검은', '흰', '붉은', '비밀', '이야기', '꿈', '생',
        '죽음', '남자', '여자', '소년', '소녀', '영웅', '전설'
    ]
};

// Language to country mapping for OMDB API
const LANGUAGE_COUNTRIES = {
    'en': ['USA', 'UK', 'Canada', 'Australia'],
    'vi': ['Vietnam'],
    'zh': ['China', 'Hong Kong', 'Taiwan'],
    'ko': ['South Korea', 'Korea']
};

// Cache for movie data
const movieCache = new Map();
const searchCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour for movies
const SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 minutes for search results

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
function levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Apply character substitutions for common typos
 * @param {string} word - Word to process
 * @returns {string[]} Array of word variants with substitutions
 */
function applyCharacterSubstitutions(word) {
    const substitutions = {
        'e': ['ee', 'ea'],
        'i': ['y', 'ee'],
        'c': ['k', 'ck'],
        'k': ['c', 'ck'],
        's': ['z', 'c'],
        'z': ['s'],
        'f': ['ph'],
        'ph': ['f'],
        'b': ['p'],
        'p': ['b'],
        'd': ['t'],
        't': ['d']
    };

    const variants = [word];
    const lowerWord = word.toLowerCase();

    // Try substitutions for each character pattern
    for (const [from, toList] of Object.entries(substitutions)) {
        if (lowerWord.includes(from)) {
            for (const to of toList) {
                const variant = lowerWord.replace(new RegExp(from, 'g'), to);
                variants.push(variant);
                // Title case variant
                variants.push(variant.charAt(0).toUpperCase() + variant.slice(1));
            }
        }
    }

    return [...new Set(variants)];
}

/**
 * Generate query variants for fuzzy searching with advanced matching
 * @param {string} query - Original query
 * @returns {string[]} Array of query variants
 */
function generateQueryVariants(query) {
    const variants = [];

    // Original query
    variants.push(query);

    // Title case (capitalize first letter of each word)
    const titleCase = query
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    variants.push(titleCase);

    // All lowercase
    variants.push(query.toLowerCase());

    // All uppercase
    variants.push(query.toUpperCase());

    // Common typo corrections (word-level)
    const typoCorrections = {
        'meet': 'met',
        'teh': 'the',
        'adn': 'and',
        'taht': 'that',
        'thier': 'their',
        'recieve': 'receive',
        'freind': 'friend',
        'breeking': 'breaking',
        'braking': 'breaking',
        'babie': 'barbie',
        'barbij': 'barbie',
        'barbi': 'barbie',
        'darknight': 'dark knight',
        'spiderman': 'spider man',
        'spyder': 'spider',
        'spyderman': 'spider man',
        'superman': 'super man',
        'supermen': 'super man',
        'batmen': 'batman',
        'batmam': 'batman',
        'starwars': 'star wars',
        'starwar': 'star wars',
        'harrypotter': 'harry potter',
        'lordoftherings': 'lord of the rings',
        'lotr': 'lord of the rings',
        'got': 'game of thrones',
        'gameofthrones': 'game of thrones'
    };

    // Apply word-level typo corrections
    let correctedQuery = titleCase;
    for (const [typo, correct] of Object.entries(typoCorrections)) {
        const typoRegex = new RegExp(`\\b${typo}\\b`, 'gi');
        if (typoRegex.test(correctedQuery)) {
            correctedQuery = correctedQuery.replace(typoRegex, correct);
            variants.push(correctedQuery);
        }
    }

    // Apply character-level substitutions for major words
    const words = titleCase.split(' ');
    const majorWords = words.filter(w => w.length > 3); // Focus on longer words

    for (const word of majorWords) {
        const wordVariants = applyCharacterSubstitutions(word);
        for (const variant of wordVariants) {
            if (variant !== word.toLowerCase() && variant !== word) {
                // Replace the word in the full query
                const newQuery = titleCase.replace(new RegExp(`\\b${word}\\b`, 'gi'), variant);
                variants.push(newQuery);

                // Also try title case version
                const titleVariant = newQuery
                    .split(' ')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                    .join(' ');
                variants.push(titleVariant);
            }
        }
    }

    // Remove duplicates and limit variants to prevent too many API calls
    const uniqueVariants = [...new Set(variants)];
    return uniqueVariants.slice(0, 10); // Limit to 10 variants max
}

// Clean old cache entries periodically
setInterval(() => {
    const now = Date.now();

    // Clean movie cache
    for (const [key, value] of movieCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            movieCache.delete(key);
        }
    }

    // Clean search cache
    for (const [key, value] of searchCache.entries()) {
        if (now - value.timestamp > SEARCH_CACHE_TTL) {
            searchCache.delete(key);
        }
    }
}, 5 * 60 * 1000); // Clean every 5 minutes

/**
 * Search for movies, series, and episodes with fuzzy matching
 * @param {string} query - Title to search
 * @param {number} page - Page number (default: 1)
 * @returns {Promise<Object>} Search results (all types: movies, series, episodes)
 */
async function searchMovies(query, page = 1) {
    // Check cache first (use original query for cache key)
    const cacheKey = `search_${query}_${page}`;
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < SEARCH_CACHE_TTL) {
        console.log(`✓ Cache hit for search: ${query} (page ${page})`);
        return cached.data;
    }

    // Try original query first
    let result = await trySearch(query, page);

    // If no results, try query variants for fuzzy matching
    if (!result.success || result.movies.length === 0) {
        console.log(`🔍 No results for "${query}", trying variants...`);
        const variants = generateQueryVariants(query);

        for (const variant of variants) {
            if (variant === query) continue; // Skip original, already tried

            console.log(`  → Trying: "${variant}"`);
            result = await trySearch(variant, page);

            if (result.success && result.movies.length > 0) {
                console.log(`  ✓ Found results with: "${variant}"`);
                break;
            }
        }
    }

    // Store in cache (even if no results to avoid repeated failed searches)
    searchCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
    });

    return result;
}

/**
 * Try a single search query against OMDB API
 * @param {string} query - Query string
 * @param {number} page - Page number
 * @returns {Promise<Object>} Search result
 */
async function trySearch(query, page) {
    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: OMDB_API_KEY,
                s: query,
                page: page
                // Removed type filter to search everything (movies, series, episodes)
            },
            timeout: 5000 // Reduced from 10s to 5s
        });

        if (response.data.Response === 'True') {
            return {
                success: true,
                movies: response.data.Search || [],
                totalResults: parseInt(response.data.totalResults) || 0,
                page: page
            };
        } else {
            return {
                success: false,
                error: response.data.Error || 'No results found',
                movies: [],
                totalResults: 0
            };
        }
    } catch (error) {
        console.error('Error searching OMDB:', error.message);
        return {
            success: false,
            error: error.message,
            movies: [],
            totalResults: 0
        };
    }
}

/**
 * Get movie details by IMDB ID
 * @param {string} imdbId - IMDB ID (e.g., 'tt1375666')
 * @returns {Promise<Object>} Detailed movie information
 */
async function getMovieDetails(imdbId) {
    // Check cache first
    const cached = movieCache.get(imdbId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        console.log(`✓ Cache hit for movie: ${imdbId}`);
        return cached.data;
    }

    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: OMDB_API_KEY,
                i: imdbId,
                plot: 'full' // Get full plot
            },
            timeout: 5000 // Reduced from 10s to 5s
        });

        if (response.data.Response === 'True') {
            const result = {
                success: true,
                movie: response.data
            };

            // Store in cache
            movieCache.set(imdbId, {
                data: result,
                timestamp: Date.now()
            });

            return result;
        } else {
            return {
                success: false,
                error: response.data.Error || 'Movie not found'
            };
        }
    } catch (error) {
        console.error('Error getting movie details from OMDB:', error.message);
        throw new Error('Failed to get movie details: ' + error.message);
    }
}

/**
 * Search movies by title and year
 * @param {string} title - Movie title
 * @param {number} year - Release year
 * @returns {Promise<Object>} Movie details
 */
async function searchByTitleAndYear(title, year) {
    try {
        const response = await axios.get(OMDB_BASE_URL, {
            params: {
                apikey: OMDB_API_KEY,
                t: title,
                y: year,
                plot: 'full'
            },
            timeout: 5000 // Reduced from 10s to 5s
        });

        if (response.data.Response === 'True') {
            return {
                success: true,
                movie: response.data
            };
        } else {
            return {
                success: false,
                error: response.data.Error || 'Movie not found'
            };
        }
    } catch (error) {
        console.error('Error searching movie by title and year:', error.message);
        throw new Error('Failed to search movie: ' + error.message);
    }
}

/**
 * Get random movies by year range with language support
 * @param {number} startYear - Start year
 * @param {number} endYear - End year
 * @param {number} count - Number of movies to return
 * @param {string} language - Language code (en, vi, zh, ko)
 * @returns {Promise<Object>} Random movies and series
 */
async function getRandomMoviesByYearRange(startYear, endYear, count = 10, language = 'en') {
    try {
        const results = [];
        const seenIds = new Set();
        const maxAttempts = count * 3; // Try 3x to get enough unique movies
        let attempts = 0;

        // Get keywords for the specified language
        const keywords = SEARCH_KEYWORDS[language] || SEARCH_KEYWORDS['en'];
        const countries = LANGUAGE_COUNTRIES[language] || [];

        while (results.length < count && attempts < maxAttempts) {
            attempts++;

            // Random year in range
            const randomYear = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;

            // Random keyword
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

            try {
                // Search OMDB
                const response = await axios.get(OMDB_BASE_URL, {
                    params: {
                        apikey: OMDB_API_KEY,
                        s: randomKeyword,
                        y: randomYear,
                        type: '' // Include both movies and series
                    },
                    timeout: 5000
                });

                if (response.data.Response === 'True' && response.data.Search) {
                    // Filter by country if not English
                    let movies = response.data.Search;

                    // For non-English languages, try to filter by country
                    if (language !== 'en' && countries.length > 0) {
                        // Since OMDB search doesn't return country, we'll use all results
                        // but prioritize ones that might be from target countries
                        movies = movies;
                    }

                    // Get random item from results
                    const randomMovie = movies[Math.floor(Math.random() * movies.length)];

                    // Add if not duplicate
                    if (randomMovie && !seenIds.has(randomMovie.imdbID)) {
                        seenIds.add(randomMovie.imdbID);
                        results.push({
                            Title: randomMovie.Title,
                            Year: randomMovie.Year,
                            imdbID: randomMovie.imdbID,
                            Type: randomMovie.Type,
                            Poster: randomMovie.Poster
                        });
                    }
                }
            } catch (err) {
                // Skip failed searches
                console.log(`Failed search for ${randomKeyword} (${randomYear}):`, err.message);
            }

            // Small delay to avoid rate limiting
            if (attempts % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return {
            movies: results,
            total: results.length
        };
    } catch (error) {
        console.error('Error getting random movies:', error.message);
        throw new Error('Failed to get random movies: ' + error.message);
    }
}

/**
 * Get trending movies (2020-2025)
 * @param {string} language - Language code (en, vi, zh, ko)
 * @returns {Promise<Object>} Trending movies and series
 */
async function getTrendingMovies(language = 'en') {
    const currentYear = new Date().getFullYear();
    return await getRandomMoviesByYearRange(2020, currentYear, 10, language);
}

/**
 * Get popular movies (2010-2020)
 * @param {string} language - Language code (en, vi, zh, ko)
 * @returns {Promise<Object>} Popular movies and series
 */
async function getPopularMovies(language = 'en') {
    return await getRandomMoviesByYearRange(2010, 2020, 10, language);
}

/**
 * Get latest movies (2024-2025)
 * @param {string} language - Language code (en, vi, zh, ko)
 * @returns {Promise<Object>} Latest movies and series
 */
async function getLatestMovies(language = 'en') {
    const currentYear = new Date().getFullYear();
    return await getRandomMoviesByYearRange(2024, currentYear, 10, language);
}

/**
 * Clear search cache
 */
function clearCache() {
    const size = searchCache.size;
    searchCache.clear();
    console.log(`✓ Cleared OMDB search cache (${size} entries)`);
}

/**
 * Clear movie details cache
 */
function clearMovieCache() {
    const size = movieCache.size;
    movieCache.clear();
    console.log(`✓ Cleared OMDB movie cache (${size} entries)`);
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
 * Get cache statistics for movie cache
 */
function getMovieCacheStats() {
    return {
        size: movieCache.size,
        ttl: `${CACHE_TTL / 1000 / 60} minutes`
    };
}

module.exports = {
    searchMovies,
    getMovieDetails,
    searchByTitleAndYear,
    getTrendingMovies,
    getPopularMovies,
    getLatestMovies,
    clearCache,
    clearMovieCache,
    getCacheStats,
    getMovieCacheStats
};
