// API Client - Central Export
// Import everything from here for cleaner imports

// Export API client instance
export { default as apiClient, setAuthToken, clearAuthToken, isAuthenticated } from './client'

// Export all endpoint constants
export { API_ENDPOINTS, API_BASE_URL, API_VERSION } from './endpoints'
export {
    AUTH_ENDPOINTS,
    MOVIE_ENDPOINTS,
    TORRENT_ENDPOINTS,
    QBITTORRENT_ENDPOINTS,
    SETTINGS_ENDPOINTS,
    HISTORY_ENDPOINTS,
    LOG_ENDPOINTS,
    SYSTEM_ENDPOINTS,
    ADMIN_ENDPOINTS,
} from './endpoints'

// Export all types
export type * from './types'

// Export error handling utilities
export {
    getErrorMessage,
    createApiError,
    logError,
    isAuthError,
    isNetworkError,
    shouldRetry,
    getRetryDelay,
    DEFAULT_RETRY_CONFIG,
} from './errorHandler'
export type { RetryConfig } from './errorHandler'
