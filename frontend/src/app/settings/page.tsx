/**
 * Settings Page
 * Configure application settings including qBittorrent and Jellyfin
 */

'use client'

import { useRouter } from 'next/navigation'
import {
    QBittorrentSettingsForm,
    JellyfinSettingsForm,
} from '@/features/settings'

export default function SettingsPage() {
    const router = useRouter()

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
                <span>←</span>
                <span>Back</span>
            </button>

            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-gray-400">Configure your application settings</p>
            </div>

            {/* Settings Components */}
            <div className="space-y-6">
                <QBittorrentSettingsForm />
                <JellyfinSettingsForm />
            </div>
        </div>
    )
}
