// Auth Feature - useLogin Hook
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../services/authService'
import type { LoginCredentials } from '../types'

export function useLogin() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const login = async (credentials: LoginCredentials, onSuccess?: () => void) => {
        setError('')
        setLoading(true)

        try {
            const result = await authService.login(credentials)

            if (result.success) {
                if (onSuccess) {
                    onSuccess()
                } else {
                    router.push('/')
                    router.refresh()
                }
            } else {
                setError(result.error || 'Login failed')
            }

            return result
        } catch (err) {
            const errorMessage = 'An error occurred. Please try again.'
            setError(errorMessage)
            console.error('Login error:', err)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    return {
        login,
        loading,
        error,
        setError,
    }
}
