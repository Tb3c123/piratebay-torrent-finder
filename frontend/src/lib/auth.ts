// Authentication utilities for frontend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
    id: number;
    username: string;
    is_admin: boolean;
    created_at: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
    message?: string;
}

/**
 * Register a new user
 */
export async function register(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
}

/**
 * Login user
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (data.success && data.token) {
        // Save token and user to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    const token = getAuthToken();

    if (token) {
        try {
            await fetch(`${API_URL}/api/v1/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local storage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
}

/**
 * Get current auth token
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
    const user = getCurrentUser();
    return user?.is_admin === true;
}

/**
 * Get user info from server
 */
export async function fetchUserInfo(): Promise<User | null> {
    const token = getAuthToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success && data.user) {
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        }
    } catch (error) {
        console.error('Fetch user info error:', error);
    }

    return null;
}

/**
 * Change password
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<AuthResponse> {
    const token = getAuthToken();
    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    const response = await fetch(`${API_URL}/api/v1/auth/change-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await response.json();

    if (data.success) {
        // Clear token after password change (user needs to re-login)
        await logout();
    }

    return data;
}
