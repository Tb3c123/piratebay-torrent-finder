// Settings Feature - useJellyfinSettings Hook
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { settingsService } from '../services/settingsService'
import type { JellyfinSettings, JellyfinTestResult } from '../types'

export function useJellyfinSettings(userId?: number) {
    const { isAuthenticated } = useAuth()
    const [settings, setSettings] = useState<JellyfinSettings>({
        url: '',
        apiKey: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<JellyfinTestResult | null>(null)
    const [showApiKey, setShowApiKey] = useState(false)

    // Load settings on mount - only if authenticated
    useEffect(() => {
        if (isAuthenticated && userId) {
            loadSettings()
        } else {
            setLoading(false)
        }
    }, [isAuthenticated, userId])

    const loadSettings = async () => {
        setLoading(true)
        const data = await settingsService.loadJellyfin(userId)
        if (data) {
            setSettings(data)
        }
        setLoading(false)
    }

    const updateField = (field: keyof JellyfinSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [field]: value }))
        setTestResult(null) // Clear test result when settings change
    }

    const save = async (saveLibraries: boolean = true): Promise<boolean> => {
        setSaving(true)
        setTestResult(null)

        const result = await settingsService.saveJellyfin(
            settings,
            userId,
            saveLibraries
        )
        setSaving(false)

        return result.success
    }

    const test = async (): Promise<JellyfinTestResult> => {
        setTesting(true)
        setTestResult(null)

        const result = await settingsService.testJellyfin(settings)
        setTestResult(result)
        setTesting(false)

        return result
    }

    return {
        settings,
        loading,
        saving,
        testing,
        testResult,
        showApiKey,
        setShowApiKey,
        updateField,
        save,
        test,
    }
}
