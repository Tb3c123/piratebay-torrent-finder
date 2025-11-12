// API Request and Response Types

import type { Torrent, MovieDetails } from '../types'

// ==================== Common Types ====================

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T = unknown> {
    success: boolean
    data: T[]
    total: number
    page: number
    limit: number
}

export interface ApiError {
    message: string
    statusCode?: number
    details?: unknown
}

// ==================== Auth Types ====================

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
}

export interface AuthResponse {
    success: boolean
    data: {
        token: string
        user: User
    }
}

export interface User {
    id: number
    username: string
    email: string
    role: 'user' | 'admin'
    createdAt: string
}

// ==================== Movie Types ====================

export interface MovieSearchRequest {
    query: string
    page?: number
}

export interface MovieSearchResponse {
    success: boolean
    data: {
        success: boolean
        movies: Movie[]
        totalResults?: string | number
    }
}

export interface Movie {
    Title: string
    Year: string
    imdbID: string
    Type: string
    Poster: string
}

export interface MovieDetailsResponse {
    success: boolean
    data: MovieDetails
}

export interface PopularMoviesResponse {
    success: boolean
    data: Movie[]
}

// ==================== Torrent Types ====================

export interface TorrentSearchRequest {
    query: string
    category?: string
    page?: string | number
}

export interface TorrentSearchResponse {
    success: boolean
    data: Torrent[]
}

export interface TorrentDetailsResponse {
    success: boolean
    data: Torrent
}

// ==================== Download/qBittorrent Types ====================

export interface QBittorrentStatus {
    connected: boolean
    version?: string
    torrentsCount?: number
}

export interface QBittorrentTorrent {
    hash: string
    name: string
    size: number
    progress: number
    dlspeed: number
    upspeed: number
    eta: number
    state: string
    category: string
    tags: string
    added_on: number
}

export interface AddTorrentRequest {
    magnetLink: string
    category?: string
    savePath?: string
}

export interface AddTorrentResponse {
    success: boolean
    message?: string
    data?: {
        hash?: string
    }
}

export interface TorrentActionRequest {
    hash: string
}

// ==================== Settings Types ====================

export interface QBittorrentSettings {
    url: string
    username: string
    password: string
}

export interface JellyfinSettings {
    url: string
    apiKey: string
    savedLibraries?: JellyfinLibrary[]
}

export interface JellyfinLibrary {
    id: string
    name: string
    type: string
    paths: string[]
}

export interface SettingsResponse<T = unknown> {
    success: boolean
    data: T
}

export interface TestConnectionRequest {
    url: string
    username?: string
    password?: string
    apiKey?: string
}

export interface TestConnectionResponse {
    success: boolean
    message: string
    data?: {
        version?: string
        [key: string]: unknown
    }
}

// ==================== History Types ====================

export interface SearchHistoryItem {
    id: number
    query: string
    type: 'movie' | 'torrent' | 'direct'
    resultCount: number
    timestamp: string
    userId?: number
}

export interface SearchHistoryResponse {
    success: boolean
    data: SearchHistoryItem[]
}

// ==================== Logs Types ====================

export interface LogEntry {
    id: number
    level: 'info' | 'warn' | 'error' | 'debug'
    action: string
    details: string
    timestamp: string
}

export interface LogsResponse {
    success: boolean
    data: {
        logs: LogEntry[]
        total: number
        limit: number
    }
}

export interface LogStatsResponse {
    success: boolean
    data: {
        total: number
        byLevel: {
            info: number
            warn: number
            error: number
            debug: number
        }
        recent: LogEntry[]
    }
}

// ==================== System Types ====================

export interface SystemHealthResponse {
    success: boolean
    data: {
        status: 'healthy' | 'degraded' | 'unhealthy'
        timestamp: string
        uptime: number
        memory: {
            rss: string
            heapTotal: string
            heapUsed: string
            external: string
        }
        version: string
        deprecationWarning?: string
    }
}

export interface CacheStats {
    omdb: {
        details: number
        search: number
    }
    piratebay: {
        search: number
    }
}

export interface CacheStatsResponse {
    success: boolean
    data: CacheStats
}
