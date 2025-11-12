'use client'

// Axios Client with Interceptors

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL } from './endpoints'
import { createApiError, getErrorMessage, logError, shouldRetry, getRetryDelay } from './errorHandler'

// ==================== Configuration ====================

const config: AxiosRequestConfig = {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
        'Content-Type': 'application/json',
    },
}

// ==================== Create Axios Instance ====================

export const apiClient: AxiosInstance = axios.create(config)

// ==================== Request Interceptor ====================

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Add authentication token if available
        const token = getAuthToken()
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            })
        }

        // Add request timestamp for tracking
        config.metadata = { startTime: Date.now() }

        return config
    },
    (error: AxiosError) => {
        logError('Request Interceptor', error)
        return Promise.reject(error)
    }
)

// ==================== Response Interceptor ====================

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            const config = response.config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }
            const duration = config.metadata?.startTime 
                ? Date.now() - config.metadata.startTime 
                : 0

            console.log(
                `[API Response] ${config.method?.toUpperCase()} ${config.url} - ${response.status} (${duration}ms)`,
                response.data
            )
        }

        return response
    },
    async (error: AxiosError) => {
        const config = error.config as (InternalAxiosRequestConfig & { 
            _retry?: number 
            metadata?: { startTime: number }
        }) | undefined

        // Log error in development
        if (process.env.NODE_ENV === 'development' && config) {
            const duration = config.metadata?.startTime 
                ? Date.now() - config.metadata.startTime 
                : 0

            console.error(
                `[API Error] ${config.method?.toUpperCase()} ${config.url} - ${error.response?.status || 'Network Error'} (${duration}ms)`,
                {
                    error: error.response?.data,
                    message: getErrorMessage(error),
                }
            )
        }

        // Handle authentication errors
        if (error.response?.status === 401) {
            // Clear auth token
            clearAuthToken()
            
            // Redirect to login (only in browser)
            if (typeof window !== 'undefined' && window.location.pathname !== '/auth/login') {
                window.location.href = '/auth/login'
            }
        }

        // Retry logic
        if (config && shouldRetry(error)) {
            const retryCount = config._retry || 0
            const maxRetries = 3

            if (retryCount < maxRetries) {
                config._retry = retryCount + 1
                const delay = getRetryDelay(retryCount)

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[API Retry] Attempt ${retryCount + 1}/${maxRetries} after ${delay}ms`)
                }

                await new Promise(resolve => setTimeout(resolve, delay))
                return apiClient.request(config)
            }
        }

        logError('Response Interceptor', error)
        return Promise.reject(createApiError(error))
    }
)

// ==================== Helper Functions ====================

/**
 * Get authentication token from storage
 */
function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        return localStorage.getItem('authToken')
    } catch (error) {
        console.error('Failed to get auth token:', error)
        return null
    }
}

/**
 * Set authentication token in storage
 */
export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.setItem('authToken', token)
    } catch (error) {
        console.error('Failed to set auth token:', error)
    }
}

/**
 * Clear authentication token from storage
 */
export function clearAuthToken(): void {
    if (typeof window === 'undefined') {
        return
    }

    try {
        localStorage.removeItem('authToken')
    } catch (error) {
        console.error('Failed to clear auth token:', error)
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null
}

// ==================== Type Extensions ====================

// Extend Axios types to support metadata
declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number
        }
        _retry?: number
    }
}

export default apiClient
