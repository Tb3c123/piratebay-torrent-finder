// Settings Feature - JellyfinSettings Component
'use client'

import { Input, Button, Alert } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import { useJellyfinSettings } from '../hooks/useJellyfinSettings'
import { useSettingsValidation } from '../hooks/useSettingsValidation'
import { SettingsCard } from './SettingsCard'

const JELLYFIN_URL_PLACEHOLDER =
  process.env.NEXT_PUBLIC_JELLYFIN_URL_PLACEHOLDER || 'http://localhost:8096'
const JELLYFIN_API_KEY_PLACEHOLDER =
  process.env.NEXT_PUBLIC_JELLYFIN_API_KEY_PLACEHOLDER || ''

export function JellyfinSettings() {
  const { user } = useAuth()
  const {
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
  } = useJellyfinSettings(user?.id)

  const { errors, clearError, validateJellyfin } = useSettingsValidation()

  const handleSave = async () => {
    if (!validateJellyfin(settings)) {
      return
    }

    const success = await save(true)
    if (success) {
      alert('Jellyfin settings and libraries saved successfully!')
    } else {
      alert('Failed to save Jellyfin settings')
    }
  }

  const handleTest = async () => {
    if (!validateJellyfin(settings)) {
      return
    }

    await test()
  }

  const handleInputChange = (field: 'url' | 'apiKey', value: string) => {
    updateField(field, value)
    clearError(field)
  }

  if (loading) {
    return (
      <SettingsCard
        icon="🎬"
        title="Jellyfin Connection"
        description="Configure connection to your Jellyfin media server"
      >
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard
      icon="🎬"
      title="Jellyfin Connection"
      description="Configure connection to your Jellyfin media server"
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* URL Field */}
        <Input
          label="Server URL"
          id="jellyfin-url"
          type="text"
          value={settings.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder={JELLYFIN_URL_PLACEHOLDER}
          error={errors.url}
          helperText="Example: http://localhost:8096 or https://jellyfin.yourserver.com"
        />

        {/* API Key Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              placeholder={JELLYFIN_API_KEY_PLACEHOLDER}
              className={`w-full px-4 py-2 pr-12 bg-gray-700 text-white border ${
                errors.apiKey ? 'border-red-500' : 'border-gray-600'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono`}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
            >
              <span className="text-xl">{showApiKey ? '👁️' : '👁️‍🗨️'}</span>
            </button>
          </div>
          {errors.apiKey && (
            <p className="mt-1 text-sm text-red-400">{errors.apiKey}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Get your API key from Jellyfin Dashboard → API Keys
          </p>
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-lg ${
              testResult.success
                ? 'bg-green-900/30 border border-green-600 text-green-400'
                : 'bg-red-900/30 border border-red-600 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span>{testResult.success ? '✓' : '✗'}</span>
              <span className="text-sm font-semibold">{testResult.message}</span>
            </div>

            {testResult.success && testResult.serverName && (
              <div className="ml-6 text-sm space-y-1">
                <p>Server: {testResult.serverName}</p>
                <p>Version: {testResult.version}</p>

                {testResult.libraries && testResult.libraries.length > 0 && (
                  <div className="mt-3">
                    <p className="font-semibold mb-2">Available Libraries:</p>
                    <div className="space-y-2">
                      {testResult.libraries.map((lib) => (
                        <div
                          key={lib.id}
                          className="bg-gray-800/50 p-2 rounded"
                        >
                          <p className="font-medium">
                            {lib.name}
                            {lib.type && (
                              <span className="text-gray-400 ml-2">
                                ({lib.type})
                              </span>
                            )}
                          </p>
                          {lib.paths && lib.paths.length > 0 && (
                            <div className="mt-1 text-xs text-gray-300 space-y-1">
                              {lib.paths.map((path, idx) => (
                                <p
                                  key={idx}
                                  className="font-mono bg-gray-900/50 px-2 py-1 rounded"
                                >
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
        <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div className="text-sm text-purple-300">
              <p className="font-semibold mb-1">Jellyfin Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-200">
                <li>Generate API key from Dashboard → Advanced → API Keys</li>
                <li>Default Jellyfin port is 8096</li>
                <li>
                  Connection test will show all your media libraries and their
                  paths
                </li>
                <li>
                  Libraries with type &quot;movies&quot; or &quot;tvshows&quot; can be used
                  for torrent downloads
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
