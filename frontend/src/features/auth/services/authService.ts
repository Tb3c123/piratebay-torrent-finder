// Auth Feature - API Service
import { apiClient, AUTH_ENDPOINTS } from '@/lib/api'
import type {
    User,
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    ChangePasswordData
} from '../types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/**
 * Get auth token from localStorage
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
}

/**
 * Set auth token in localStorage
 */
export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('auth_token', token)
}

/**
 * Remove auth token from localStorage
 */
export function removeAuthToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem('user')
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch {
        return null
    }
}

/**
 * Save user to localStorage
 */
export function saveUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('user', JSON.stringify(user))
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
    const user = getCurrentUser()
    return user?.is_admin === true
}

/**
 * Auth Service - All authentication-related API calls
 */
export const authService = {
    /**
     * Register a new user
     */
    register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password,
                }),
            })

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Register error:', error)
            return {
                success: false,
                error: 'Failed to register. Please try again.',
            }
        }
    },

    /**
     * Login user
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            const data = await response.json()

            if (data.success && data.token && data.user) {
                // Save to localStorage
                setAuthToken(data.token)
                saveUser(data.user)
            }

            return data
        } catch (error) {
            console.error('Login error:', error)
            return {
                success: false,
                error: 'Failed to login. Please try again.',
            }
        }
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        const token = getAuthToken()

        if (token) {
            try {
                await fetch(`${API_URL}/api/v1/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                })
            } catch (error) {
                console.error('Logout error:', error)
            }
        }

        // Clear local storage
        removeAuthToken()
    },

    /**
     * Get current user info from server
     */
    fetchUserInfo: async (): Promise<User | null> => {
        const token = getAuthToken()
        if (!token) return null

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            })

            const data = await response.json()

            if (data.success && data.user) {
                // Update localStorage
                saveUser(data.user)
                return data.user
            }
        } catch (error) {
            console.error('Fetch user info error:', error)
        }

        return null
    },

    /**
     * Change password
     */
    changePassword: async (passwordData: ChangePasswordData): Promise<AuthResponse> => {
        const token = getAuthToken()
        if (!token) {
            return { success: false, error: 'Not authenticated' }
        }

        try {
            const response = await fetch(`${API_URL}/api/v1/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(passwordData),
            })

            const data = await response.json()

            if (data.success) {
                // Clear token after password change (user needs to re-login)
                await authService.logout()
            }

            return data
        } catch (error) {
            console.error('Change password error:', error)
            return {
                success: false,
                error: 'Failed to change password. Please try again.',
            }
        }
    },

    /**
     * Check if any users exist (for first-time setup)
     */
    checkHasUsers: async (): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/api/v1/auth/admin/users`)
            if (!response.ok) return false

            const data = await response.json()
            return Array.isArray(data.users) && data.users.length > 0
        } catch {
            return false
        }
    },
}
