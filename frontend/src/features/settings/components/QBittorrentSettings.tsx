// Settings Feature - QBittorrentSettings Component
'use client'

import { Input, Button, Alert } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useQBittorrentSettings } from '../hooks/useQBittorrentSettings'
import { useSettingsValidation } from '../hooks/useSettingsValidation'
import { SettingsCard } from './SettingsCard'

const QBITTORRENT_URL_PLACEHOLDER =
  process.env.NEXT_PUBLIC_QBITTORRENT_URL_PLACEHOLDER || 'http://localhost:8080'

export function QBittorrentSettings() {
  const { user } = useAuth()
  const {
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
  } = useQBittorrentSettings(user?.id)

  const { errors, clearError, validateQBittorrent } = useSettingsValidation()

  const handleSave = async () => {
    if (!validateQBittorrent(settings)) {
      return
    }

    const success = await save()
    if (success) {
      alert('Settings saved successfully!')
    } else {
      alert('Failed to save settings')
    }
  }

  const handleTest = async () => {
    if (!validateQBittorrent(settings)) {
      return
    }

    await test()
  }

  const handleInputChange = (field: 'url' | 'username' | 'password', value: string) => {
    updateField(field, value)
    clearError(field)
  }

  if (loading) {
    return (
      <SettingsCard
        icon="⚡"
        title="qBittorrent Connection"
        description="Configure connection to your qBittorrent server"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard
      icon="⚡"
      title="qBittorrent Connection"
      description="Configure connection to your qBittorrent server"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* URL Field */}
        <Input
          label="Server URL"
          id="qbit-url"
          type="text"
          value={settings.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder={QBITTORRENT_URL_PLACEHOLDER}
          error={errors.url}
          helperText="Example: http://localhost:8080 or https://your-server.com"
        />

        {/* Username Field */}
        <Input
          label="Username"
          id="qbit-username"
          type="text"
          value={settings.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="admin"
          error={errors.username}
        />

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={settings.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
              className={`w-full px-4 py-2 pr-12 bg-gray-700 text-white border ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-400">{errors.password}</p>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <Alert
            type={testResult.success ? 'success' : 'error'}
            message={testResult.message}
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleTest}
            disabled={testing || saving}
            variant="secondary"
            loading={testing}
            className="flex-1"
          >
            {!testing && <span className="mr-2">🔌</span>}
            Test Connection
          </Button>

          <Button
            onClick={handleSave}
            disabled={saving || testing}
            variant="primary"
            loading={saving}
            className="flex-1"
          >
            {!saving && <span className="mr-2">💾</span>}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6">
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
    </SettingsCard>
  )
}
