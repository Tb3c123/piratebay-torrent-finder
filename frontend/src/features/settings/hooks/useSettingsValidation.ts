// Settings Feature - useSettingsValidation Hook
'use client'

import { useState } from 'react'
import type { SettingsFormErrors, QBittorrentSettings, JellyfinSettings } from '../types'

export function useSettingsValidation() {
    const [errors, setErrors] = useState<SettingsFormErrors>({})

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateQBittorrent = (settings: QBittorrentSettings): boolean => {
        const newErrors: SettingsFormErrors = {}

        if (!settings.url.trim()) {
            newErrors.url = 'qBittorrent URL is required'
        } else if (
            !settings.url.startsWith('http://') &&
            !settings.url.startsWith('https://')
        ) {
            newErrors.url = 'URL must start with http:// or https://'
        }

        if (!settings.username.trim()) {
            newErrors.username = 'Username is required'
        }

        if (!settings.password.trim()) {
            newErrors.password = 'Password is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const validateJellyfin = (settings: JellyfinSettings): boolean => {
        const newErrors: SettingsFormErrors = {}

        if (!settings.url.trim()) {
            newErrors.url = 'Jellyfin URL is required'
        } else if (
            !settings.url.startsWith('http://') &&
            !settings.url.startsWith('https://')
        ) {
            newErrors.url = 'URL must start with http:// or https://'
        }

        if (!settings.apiKey.trim()) {
            newErrors.apiKey = 'API key is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    return {
        errors,
        clearError,
        validateQBittorrent,
        validateJellyfin,
    }
}
