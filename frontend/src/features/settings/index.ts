// Settings Feature - Central Export
// This feature handles application configuration

// Components
export { QBittorrentSettings as QBittorrentSettingsForm } from './components/QBittorrentSettings'
export { JellyfinSettings as JellyfinSettingsForm } from './components/JellyfinSettings'
export { SettingsCard } from './components/SettingsCard'

// Hooks
export { useQBittorrentSettings } from './hooks/useQBittorrentSettings'
export { useJellyfinSettings } from './hooks/useJellyfinSettings'
export { useSettingsValidation } from './hooks/useSettingsValidation'

// Services
export { settingsService } from './services/settingsService'

// Types
export type {
    QBittorrentSettings,
    JellyfinSettings,
    JellyfinLibrary,
    SettingsTestResult,
    JellyfinTestResult,
    SettingsFormErrors,
    SettingsConfig,
} from './types'
