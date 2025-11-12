// API Endpoint Constants

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// API Version
const API_VERSION = '/api/v1'
const API_LEGACY = '/api' // Backward compatibility

/**
 * Build full API URL
 */
function buildUrl(path: string, version: 'v1' | 'legacy' = 'v1'): string {
    const prefix = version === 'v1' ? API_VERSION : API_LEGACY
    return `${API_BASE_URL}${prefix}${path}`
}

// ==================== Authentication Endpoints ====================

export const AUTH_ENDPOINTS = {
    LOGIN: buildUrl('/auth/login'),
    REGISTER: buildUrl('/auth/register'),
    LOGOUT: buildUrl('/auth/logout'),
    VERIFY: buildUrl('/auth/verify'),
    REFRESH: buildUrl('/auth/refresh'),
    
    // Legacy (for backward compatibility)
    LEGACY_LOGIN: buildUrl('/auth/login', 'legacy'),
    LEGACY_REGISTER: buildUrl('/auth/register', 'legacy'),
} as const

// ==================== Movie Endpoints ====================

export const MOVIE_ENDPOINTS = {
    SEARCH: buildUrl('/movies/search'),
    DETAILS: (imdbId: string) => buildUrl(`/movies/${imdbId}`),
    SEARCH_EXACT: buildUrl('/movies/search-exact'),
    TRENDING_POPULAR: buildUrl('/movies/trending/popular'),
    TRENDING_NOW: buildUrl('/movies/trending/now'),
    LATEST: buildUrl('/movies/latest'),
    
    // Legacy
    LEGACY_SEARCH: buildUrl('/movies/search', 'legacy'),
    LEGACY_DETAILS: (imdbId: string) => buildUrl(`/movies/${imdbId}`, 'legacy'),
} as const

// ==================== Torrent Endpoints ====================

export const TORRENT_ENDPOINTS = {
    SEARCH: buildUrl('/search'),
    DETAILS: (id: string) => buildUrl(`/torrent/${id}`),
    PARSE_MAGNET: buildUrl('/torrent/parse'),
    
    // Legacy
    LEGACY_SEARCH: buildUrl('/search', 'legacy'),
} as const

// ==================== qBittorrent Endpoints ====================

export const QBITTORRENT_ENDPOINTS = {
    ADD: buildUrl('/qbittorrent/add'),
    STATUS: buildUrl('/qbittorrent/status'),
    TORRENTS: buildUrl('/qbittorrent/torrents'),
    PAUSE: (hash: string) => buildUrl(`/qbittorrent/pause/${hash}`),
    RESUME: (hash: string) => buildUrl(`/qbittorrent/resume/${hash}`),
    FORCE_START: (hash: string) => buildUrl(`/qbittorrent/force-start/${hash}`),
    DELETE: (hash: string) => buildUrl(`/qbittorrent/delete/${hash}`),
    
    // Legacy
    LEGACY_ADD: buildUrl('/qbittorrent/add', 'legacy'),
    LEGACY_STATUS: buildUrl('/qbittorrent/status', 'legacy'),
} as const

// ==================== Settings Endpoints ====================

export const SETTINGS_ENDPOINTS = {
    // qBittorrent Settings
    QBITTORRENT_GET: buildUrl('/settings/qbittorrent'),
    QBITTORRENT_UPDATE: buildUrl('/settings/qbittorrent'),
    QBITTORRENT_TEST: buildUrl('/settings/qbittorrent/test'),
    
    // Jellyfin Settings
    JELLYFIN_GET: buildUrl('/settings/jellyfin'),
    JELLYFIN_UPDATE: buildUrl('/settings/jellyfin'),
    JELLYFIN_TEST: buildUrl('/settings/jellyfin/test'),
    JELLYFIN_LIBRARIES: buildUrl('/settings/jellyfin/libraries'),
    JELLYFIN_SAVED_LIBRARIES: buildUrl('/settings/jellyfin/saved-libraries'),
    
    // Legacy
    LEGACY_QBITTORRENT_GET: buildUrl('/settings/qbittorrent', 'legacy'),
    LEGACY_JELLYFIN_GET: buildUrl('/settings/jellyfin', 'legacy'),
} as const

// ==================== History Endpoints ====================

export const HISTORY_ENDPOINTS = {
    GET_ALL: buildUrl('/history'),
    CREATE: buildUrl('/history'),
    DELETE: (id: number) => buildUrl(`/history/${id}`),
    CLEAR_ALL: buildUrl('/history/clear'),
    
    // Legacy
    LEGACY_GET_ALL: buildUrl('/history', 'legacy'),
} as const

// ==================== Logs Endpoints ====================

export const LOG_ENDPOINTS = {
    GET_ALL: buildUrl('/logs'),
    GET_STATUS: buildUrl('/logs/status'),
    
    // Legacy
    LEGACY_GET_ALL: buildUrl('/logs', 'legacy'),
} as const

// ==================== System Endpoints ====================

export const SYSTEM_ENDPOINTS = {
    HEALTH: buildUrl('/system/health'),
    CACHE_STATS: buildUrl('/system/cache/stats'),
    CACHE_CLEAR: (type: string) => buildUrl(`/system/cache/clear/${type}`),
    RESTART: buildUrl('/system/restart'),
    
    // Legacy
    LEGACY_HEALTH: buildUrl('/system/health', 'legacy'),
} as const

// ==================== Admin Endpoints ====================

export const ADMIN_ENDPOINTS = {
    USERS: buildUrl('/admin/users'),
    USER_DETAILS: (id: number) => buildUrl(`/admin/users/${id}`),
    UPDATE_USER: (id: number) => buildUrl(`/admin/users/${id}`),
    DELETE_USER: (id: number) => buildUrl(`/admin/users/${id}`),
} as const

// ==================== Export All Endpoints ====================

export const API_ENDPOINTS = {
    AUTH: AUTH_ENDPOINTS,
    MOVIES: MOVIE_ENDPOINTS,
    TORRENTS: TORRENT_ENDPOINTS,
    QBITTORRENT: QBITTORRENT_ENDPOINTS,
    SETTINGS: SETTINGS_ENDPOINTS,
    HISTORY: HISTORY_ENDPOINTS,
    LOGS: LOG_ENDPOINTS,
    SYSTEM: SYSTEM_ENDPOINTS,
    ADMIN: ADMIN_ENDPOINTS,
} as const

// Export base URL for direct access
export { API_BASE_URL, API_VERSION }
