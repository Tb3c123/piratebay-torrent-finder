// Settings Feature - useQBittorrentSettings Hook
'use client'

import { useState, useEffect } from 'react'
import { settingsService } from '../services/settingsService'
import type { QBittorrentSettings, SettingsTestResult } from '../types'

export function useQBittorrentSettings(userId?: number) {
    const [settings, setSettings] = useState<QBittorrentSettings>({
        url: '',
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<SettingsTestResult | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    // Load settings on mount
    useEffect(() => {
        if (userId) {
            loadSettings()
        }
    }, [userId])

    const loadSettings = async () => {
        setLoading(true)
        const data = await settingsService.loadQBittorrent(userId)
        if (data) {
            setSettings(data)
        }
        setLoading(false)
    }

    const updateField = (field: keyof QBittorrentSettings, value: string) => {
        setSettings((prev) => ({ ...prev, [field]: value }))
        setTestResult(null) // Clear test result when settings change
    }

    const save = async (): Promise<boolean> => {
        setSaving(true)
        setTestResult(null)

        const result = await settingsService.saveQBittorrent(settings, userId)
        setSaving(false)

        return result.success
    }

    const test = async (): Promise<SettingsTestResult> => {
        setTesting(true)
        setTestResult(null)

        const result = await settingsService.testQBittorrent(settings)
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
        showPassword,
        setShowPassword,
        updateField,
        save,
        test,
    }
}
