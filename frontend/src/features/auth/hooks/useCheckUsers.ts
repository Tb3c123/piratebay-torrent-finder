// Auth Feature - useCheckUsers Hook
'use client'

import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

/**
 * Hook to check if any users exist in the system
 * Used to show "first user becomes admin" message
 */
export function useCheckUsers() {
  const [hasUser, setHasUser] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkUsers() {
      try {
        const exists = await authService.checkHasUsers()
        setHasUser(exists)
      } catch {
        setHasUser(false)
      } finally {
        setLoading(false)
      }
    }

    checkUsers()
  }, [])

  return {
    hasUser,
    loading,
  }
}
