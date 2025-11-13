// Auth Feature - useRegister Hook
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../services/authService'
import type { RegisterCredentials } from '../types'

export function useRegister() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const register = async (credentials: RegisterCredentials, onSuccess?: () => void) => {
        setError('')
        setLoading(true)

        // Validate passwords match
        if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return { success: false, error: 'Passwords do not match' }
        }

        try {
            const result = await authService.register(credentials)

            if (result.success) {
                setSuccess(true)

                if (onSuccess) {
                    await onSuccess()
                }

                // Always redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/auth/login')
                }, 2000)
            } else {
                setError(result.error || 'Registration failed')
            }

            return result
        } catch (err) {
            const errorMessage = 'An error occurred. Please try again.'
            setError(errorMessage)
            console.error('Registration error:', err)
            return { success: false, error: errorMessage }
        } finally {
            setLoading(false)
        }
    }

    return {
        register,
        loading,
        error,
        success,
        setError,
    }
}
