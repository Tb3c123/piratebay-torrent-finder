// Settings Feature - Type Definitions

export interface QBittorrentSettings {
  url: string
  username: string
  password: string
}

export interface JellyfinSettings {
  url: string
  apiKey: string
}

export interface JellyfinLibrary {
  id: string
  name: string
  type: string
  paths: string[]
}

export interface SettingsTestResult {
  success: boolean
  message: string
}

export interface JellyfinTestResult extends SettingsTestResult {
  serverName?: string
  version?: string
  libraries?: JellyfinLibrary[]
}

export interface SettingsFormErrors {
  [key: string]: string
}

export interface SettingsConfig {
  userId?: number
  qbittorrent?: QBittorrentSettings
  jellyfin?: JellyfinSettings
}
