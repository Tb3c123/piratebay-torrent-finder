/**
 * Settings Page
 * Configure application settings including qBittorrent connection
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Header from '@/components/Header'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Placeholder constants from environment variables
const JELLYFIN_API_KEY_PLACEHOLDER = process.env.NEXT_PUBLIC_JELLYFIN_API_KEY_PLACEHOLDER || '842803013ffd4cd4b140f9a3646e823d'
const JELLYFIN_URL_PLACEHOLDER = process.env.NEXT_PUBLIC_JELLYFIN_URL_PLACEHOLDER || 'http://localhost:8096'
const QBITTORRENT_URL_PLACEHOLDER = process.env.NEXT_PUBLIC_QBITTORRENT_URL_PLACEHOLDER || 'http://localhost:8080'

interface QBittorrentSettings {
    url: string
    username: string
    password: string
}

interface JellyfinSettings {
    url: string
    apiKey: string
}

interface JellyfinLibrary {
    id: string
    name: string
    type: string
    paths: string[]
}

export default function SettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    // Password visibility states
    const [showQBitPassword, setShowQBitPassword] = useState(false)
    const [showJellyfinApiKey, setShowJellyfinApiKey] = useState(false)

    // Jellyfin states
    const [savingJellyfin, setSavingJellyfin] = useState(false)
    const [testingJellyfin, setTestingJellyfin] = useState(false)
    const [jellyfinTestResult, setJellyfinTestResult] = useState<{ success: boolean; message: string; serverName?: string; version?: string; libraries?: JellyfinLibrary[] } | null>(null)

    const [settings, setSettings] = useState<QBittorrentSettings>({
        url: '',
        username: '',
        password: ''
    })

    const [jellyfinSettings, setJellyfinSettings] = useState<JellyfinSettings>({
        url: '',
        apiKey: ''
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [jellyfinErrors, setJellyfinErrors] = useState<Record<string, string>>({})

    // Load settings on mount
    useEffect(() => {
        loadSettings()
        loadJellyfinSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${API_URL}/api/settings/qbittorrent`)
            if (response.data.settings) {
                setSettings(response.data.settings)
            }
        } catch (error) {
            console.error('Failed to load settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadJellyfinSettings = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/settings/jellyfin`)
            if (response.data.settings) {
                setJellyfinSettings(response.data.settings)
            }
        } catch (error) {
            console.error('Failed to load Jellyfin settings:', error)
        }
    }

    const validateSettings = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!settings.url.trim()) {
            newErrors.url = 'qBittorrent URL is required'
        } else if (!settings.url.startsWith('http://') && !settings.url.startsWith('https://')) {
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

    const handleSave = async () => {
        if (!validateSettings()) {
            return
        }

        setSaving(true)
        setTestResult(null)

        try {
            await axios.post(`${API_URL}/api/settings/qbittorrent`, settings)
            alert('Settings saved successfully!')
        } catch (error: any) {
            console.error('Failed to save settings:', error)
            alert(error.response?.data?.error || 'Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    const handleTest = async () => {
        if (!validateSettings()) {
            return
        }

        setTesting(true)
        setTestResult(null)

        try {
            const response = await axios.post(`${API_URL}/api/settings/qbittorrent/test`, settings)
            setTestResult({
                success: true,
                message: response.data.message || 'Connection successful!'
            })
        } catch (error: any) {
            console.error('Connection test failed:', error)
            setTestResult({
                success: false,
                message: error.response?.data?.error || 'Connection failed'
            })
        } finally {
            setTesting(false)
        }
    }

    const handleInputChange = (field: keyof QBittorrentSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }))
        // Clear error for this field when user types
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
        // Clear test result when settings change
        setTestResult(null)
    }

    // Jellyfin functions
    const validateJellyfinSettings = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!jellyfinSettings.url.trim()) {
            newErrors.url = 'Jellyfin URL is required'
        } else if (!jellyfinSettings.url.startsWith('http://') && !jellyfinSettings.url.startsWith('https://')) {
            newErrors.url = 'URL must start with http:// or https://'
        }

        if (!jellyfinSettings.apiKey.trim()) {
            newErrors.apiKey = 'API key is required'
        }

        setJellyfinErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleJellyfinSave = async () => {
        if (!validateJellyfinSettings()) {
            return
        }

        setSavingJellyfin(true)
        setJellyfinTestResult(null)

        try {
            await axios.post(`${API_URL}/api/settings/jellyfin`, jellyfinSettings)
            alert('Jellyfin settings saved successfully!')
        } catch (error: any) {
            console.error('Failed to save Jellyfin settings:', error)
            alert(error.response?.data?.error || 'Failed to save Jellyfin settings')
        } finally {
            setSavingJellyfin(false)
        }
    }

    const handleJellyfinTest = async () => {
        if (!validateJellyfinSettings()) {
            return
        }

        setTestingJellyfin(true)
        setJellyfinTestResult(null)

        try {
            const response = await axios.post(`${API_URL}/api/settings/jellyfin/test`, jellyfinSettings)
            setJellyfinTestResult({
                success: true,
                message: response.data.message || 'Connection successful!',
                serverName: response.data.serverName,
                version: response.data.version,
                libraries: response.data.libraries
            })
        } catch (error: any) {
            console.error('Jellyfin connection test failed:', error)
            setJellyfinTestResult({
                success: false,
                message: error.response?.data?.error || 'Connection failed'
            })
        } finally {
            setTestingJellyfin(false)
        }
    }

    const handleJellyfinInputChange = (field: keyof JellyfinSettings, value: string) => {
        setJellyfinSettings(prev => ({ ...prev, [field]: value }))
        // Clear error for this field when user types
        if (jellyfinErrors[field]) {
            setJellyfinErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
        // Clear test result when settings change
        setJellyfinTestResult(null)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900">
                <Header />
                <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />

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

                {/* qBittorrent Settings Card */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">⚡</span>
                        <div>
                            <h2 className="text-xl font-semibold text-white">qBittorrent Connection</h2>
                            <p className="text-sm text-gray-400">Configure connection to your qBittorrent server</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* URL Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server URL
                            </label>
                            <input
                                type="text"
                                value={settings.url}
                                onChange={(e) => handleInputChange('url', e.target.value)}
                                placeholder={QBITTORRENT_URL_PLACEHOLDER}
                                className={`w-full px-4 py-2 bg-gray-700 text-white border ${errors.url ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.url && (
                                <p className="mt-1 text-sm text-red-400">{errors.url}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Example: http://localhost:8080 or https://your-server.com
                            </p>
                        </div>

                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={settings.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                placeholder="admin"
                                className={`w-full px-4 py-2 bg-gray-700 text-white border ${errors.username ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showQBitPassword ? "text" : "password"}
                                    value={settings.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-4 py-2 pr-12 bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowQBitPassword(!showQBitPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label={showQBitPassword ? "Hide password" : "Show password"}
                                >
                                    {showQBitPassword ? (
                                        <span className="text-xl">👁️</span>
                                    ) : (
                                        <span className="text-xl">👁️‍🗨️</span>
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Test Result */}
                        {testResult && (
                            <div className={`p-3 rounded-lg ${testResult.success
                                ? 'bg-green-900/30 border border-green-600 text-green-400'
                                : 'bg-red-900/30 border border-red-600 text-red-400'
                                }`}>
                                <div className="flex items-center gap-2">
                                    <span>{testResult.success ? '✓' : '✗'}</span>
                                    <span className="text-sm">{testResult.message}</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleTest}
                                disabled={testing || saving}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {testing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        <span>Testing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔌</span>
                                        <span>Test Connection</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={saving || testing}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        <span>Save Settings</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="mt-6 max-w-2xl">
                    <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">ℹ️</span>
                            <div className="text-sm text-blue-300">
                                <p className="font-semibold mb-1">Connection Tips:</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-200">
                                    <li>Make sure qBittorrent Web UI is enabled</li>
                                    <li>Default port is usually 8080</li>
                                    <li>If using HTTPS, ensure the certificate is valid</li>
                                    <li>Check firewall settings if connection fails</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Jellyfin Settings Card */}
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mt-6">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">🎬</span>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Jellyfin Connection</h2>
                            <p className="text-sm text-gray-400">Configure connection to your Jellyfin media server</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* URL Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Server URL
                            </label>
                            <input
                                type="text"
                                value={jellyfinSettings.url}
                                onChange={(e) => handleJellyfinInputChange('url', e.target.value)}
                                placeholder={JELLYFIN_URL_PLACEHOLDER}
                                className={`w-full px-4 py-2 bg-gray-700 text-white border ${jellyfinErrors.url ? 'border-red-500' : 'border-gray-600'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                            {jellyfinErrors.url && (
                                <p className="mt-1 text-sm text-red-400">{jellyfinErrors.url}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Example: http://localhost:8096 or https://jellyfin.yourserver.com
                            </p>
                        </div>

                        {/* API Key Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showJellyfinApiKey ? "text" : "password"}
                                    value={jellyfinSettings.apiKey}
                                    onChange={(e) => handleJellyfinInputChange('apiKey', e.target.value)}
                                    placeholder={JELLYFIN_API_KEY_PLACEHOLDER}
                                    className={`w-full px-4 py-2 pr-12 bg-gray-700 text-white border ${jellyfinErrors.apiKey ? 'border-red-500' : 'border-gray-600'
                                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowJellyfinApiKey(!showJellyfinApiKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                    aria-label={showJellyfinApiKey ? "Hide API key" : "Show API key"}
                                >
                                    {showJellyfinApiKey ? (
                                        <span className="text-xl">👁️</span>
                                    ) : (
                                        <span className="text-xl">👁️‍🗨️</span>
                                    )}
                                </button>
                            </div>
                            {jellyfinErrors.apiKey && (
                                <p className="mt-1 text-sm text-red-400">{jellyfinErrors.apiKey}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Get your API key from Jellyfin Dashboard → API Keys
                            </p>
                        </div>

                        {/* Test Result */}
                        {jellyfinTestResult && (
                            <div className={`p-3 rounded-lg ${jellyfinTestResult.success
                                ? 'bg-green-900/30 border border-green-600 text-green-400'
                                : 'bg-red-900/30 border border-red-600 text-red-400'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span>{jellyfinTestResult.success ? '✓' : '✗'}</span>
                                    <span className="text-sm font-semibold">{jellyfinTestResult.message}</span>
                                </div>

                                {jellyfinTestResult.success && jellyfinTestResult.serverName && (
                                    <div className="ml-6 text-sm space-y-1">
                                        <p>Server: {jellyfinTestResult.serverName}</p>
                                        <p>Version: {jellyfinTestResult.version}</p>

                                        {jellyfinTestResult.libraries && jellyfinTestResult.libraries.length > 0 && (
                                            <div className="mt-3">
                                                <p className="font-semibold mb-2">Available Libraries:</p>
                                                <div className="space-y-2">
                                                    {jellyfinTestResult.libraries.map((lib) => (
                                                        <div key={lib.id} className="bg-gray-800/50 p-2 rounded">
                                                            <p className="font-medium">
                                                                {lib.name}
                                                                {lib.type && <span className="text-gray-400 ml-2">({lib.type})</span>}
                                                            </p>
                                                            {lib.paths && lib.paths.length > 0 && (
                                                                <div className="mt-1 text-xs text-gray-300 space-y-1">
                                                                    {lib.paths.map((path, idx) => (
                                                                        <p key={idx} className="font-mono bg-gray-900/50 px-2 py-1 rounded">
                                                                            📁 {path}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleJellyfinTest}
                                disabled={testingJellyfin || savingJellyfin}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {testingJellyfin ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        <span>Testing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔌</span>
                                        <span>Test Connection</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleJellyfinSave}
                                disabled={savingJellyfin || testingJellyfin}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {savingJellyfin ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>💾</span>
                                        <span>Save Settings</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Jellyfin Info Section */}
                <div className="mt-6 max-w-2xl">
                    <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="text-xl">ℹ️</span>
                            <div className="text-sm text-purple-300">
                                <p className="font-semibold mb-1">Jellyfin Tips:</p>
                                <ul className="list-disc list-inside space-y-1 text-purple-200">
                                    <li>Generate API key from Dashboard → Advanced → API Keys</li>
                                    <li>Default Jellyfin port is 8096</li>
                                    <li>Connection test will show all your media libraries and their paths</li>
                                    <li>Libraries with type "movies" or "tvshows" can be used for torrent downloads</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
