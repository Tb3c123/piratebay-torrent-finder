/**
 * YouTube Data API v3 Service
 * Fetch movie/TV show trailers from YouTube
 */

const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

/**
 * Search for movie/show trailer on YouTube
 * @param {string} title - Movie or show title
 * @param {number} year - Release year (optional)
 * @returns {Promise<Object>} YouTube video details
 */
async function searchTrailer(title, year = null) {
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error('YouTube API key not configured');
        }

        // Build search query
        let searchQuery = `${title} official trailer`;
        if (year) {
            searchQuery += ` ${year}`;
        }

        const response = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                maxResults: 5,
                key: YOUTUBE_API_KEY,
                videoDuration: 'short', // Trailers are usually short
                videoEmbeddable: 'true', // Only embeddable videos
                order: 'relevance'
            }
        });

        const videos = response.data.items || [];

        if (videos.length === 0) {
            return null;
        }

        // Filter to get best trailer match
        const trailer = videos.find(video => {
            const title = video.snippet.title.toLowerCase();
            return title.includes('official') && title.includes('trailer');
        }) || videos[0]; // Fallback to first result

        return {
            videoId: trailer.id.videoId,
            title: trailer.snippet.title,
            description: trailer.snippet.description,
            thumbnail: trailer.snippet.thumbnails.high.url,
            channelTitle: trailer.snippet.channelTitle,
            publishedAt: trailer.snippet.publishedAt
        };
    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Get multiple trailer options
 * @param {string} title - Movie or show title
 * @param {number} year - Release year (optional)
 * @returns {Promise<Array>} Array of trailer options
 */
async function getTrailerOptions(title, year = null) {
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error('YouTube API key not configured');
        }

        let searchQuery = `${title} trailer`;
        if (year) {
            searchQuery += ` ${year}`;
        }

        const response = await axios.get(YOUTUBE_SEARCH_URL, {
            params: {
                part: 'snippet',
                q: searchQuery,
                type: 'video',
                maxResults: 10,
                key: YOUTUBE_API_KEY,
                videoEmbeddable: 'true',
                order: 'relevance'
            }
        });

        const videos = response.data.items || [];

        return videos.map(video => ({
            videoId: video.id.videoId,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.medium.url,
            channelTitle: video.snippet.channelTitle,
            publishedAt: video.snippet.publishedAt
        }));
    } catch (error) {
        console.error('YouTube API error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    searchTrailer,
    getTrailerOptions
};
