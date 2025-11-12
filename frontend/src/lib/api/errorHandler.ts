// API Error Handling Utilities

import type { AxiosError } from 'axios'
import type { ApiError } from './types'

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
        return error
    }

    if (error instanceof Error) {
        return error.message
    }

    if (isAxiosError(error)) {
        // Backend returned error response
        if (error.response?.data) {
            const data = error.response.data
            
            // Standard API error format: { success: false, error: "message" }
            if (typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
                return data.error
            }
            
            // Alternative format: { message: "..." }
            if (typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
                return data.message
            }
            
            // Raw string error
            if (typeof data === 'string') {
                return data
            }
        }

        // Network errors
        if (error.code === 'ECONNABORTED') {
            return 'Request timeout. Please try again.'
        }
        
        if (error.code === 'ERR_NETWORK') {
            return 'Network error. Please check your connection.'
        }

        // HTTP status errors
        if (error.response?.status) {
            switch (error.response.status) {
                case 400:
                    return 'Bad request. Please check your input.'
                case 401:
                    return 'Unauthorized. Please log in again.'
                case 403:
                    return 'Access denied. You do not have permission.'
                case 404:
                    return 'Resource not found.'
                case 500:
                    return 'Server error. Please try again later.'
                case 503:
                    return 'Service unavailable. Please try again later.'
                default:
                    return `Request failed with status ${error.response.status}`
            }
        }

        return error.message || 'An unexpected error occurred'
    }

    return 'An unexpected error occurred'
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        error.isAxiosError === true
    )
}

/**
 * Create standardized API error object
 */
export function createApiError(error: unknown): ApiError {
    const message = getErrorMessage(error)
    let statusCode: number | undefined

    if (isAxiosError(error)) {
        statusCode = error.response?.status
    }

    return {
        message,
        statusCode,
        details: error
    }
}

/**
 * Log error to console in development
 */
export function logError(context: string, error: unknown): void {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[API Error - ${context}]:`, error)
        
        if (isAxiosError(error)) {
            console.error('Request config:', error.config)
            console.error('Response:', error.response?.data)
        }
    }
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
    if (!isAxiosError(error)) {
        return false
    }

    const status = error.response?.status
    return status === 401 || status === 403
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
    if (!isAxiosError(error)) {
        return false
    }

    return (
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        !error.response
    )
}

/**
 * Retry configuration
 */
export interface RetryConfig {
    maxRetries: number
    retryDelay: number
    retryableStatuses: number[]
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableStatuses: [408, 429, 500, 502, 503, 504]
}

/**
 * Check if error should be retried
 */
export function shouldRetry(error: unknown, config: RetryConfig = DEFAULT_RETRY_CONFIG): boolean {
    if (!isAxiosError(error)) {
        return false
    }

    // Retry network errors
    if (isNetworkError(error)) {
        return true
    }

    // Retry specific status codes
    const status = error.response?.status
    if (status && config.retryableStatuses.includes(status)) {
        return true
    }

    return false
}

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(attemptNumber: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attemptNumber), 10000) // Max 10 seconds
}
