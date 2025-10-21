'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, getCurrentUser, getAuthToken, logout as logoutUser, fetchUserInfo } from '@/lib/auth'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isAdmin: boolean
    loading: boolean
    logout: () => Promise<void>
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
    logout: async () => { },
    refreshUser: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = async () => {
        const token = getAuthToken()
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const userInfo = await fetchUserInfo()
            setUser(userInfo)
        } catch (error) {
            console.error('Failed to fetch user:', error)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Initialize user from localStorage
        const storedUser = getCurrentUser()
        setUser(storedUser)
        setLoading(false)

        // Optionally refresh from server
        if (storedUser) {
            refreshUser()
        }
    }, [])

    const logout = async () => {
        await logoutUser()
        setUser(null)
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.is_admin === true,
        loading,
        logout,
        refreshUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
