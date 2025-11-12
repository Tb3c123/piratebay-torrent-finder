// Downloads Feature - Central Export
// This feature handles torrent downloads and qBittorrent management

// Components
export { DownloadCard } from './components/DownloadCard'
export { DownloadList } from './components/DownloadList'
export { DownloadsSummary as DownloadsSummaryCard } from './components/DownloadsSummary'
export { DownloadModal } from './components/DownloadModal'

// Hooks
export { useDownloads } from './hooks/useDownloads'
export { useDownloadActions } from './hooks/useDownloadActions'

// Services
export { downloadsService } from './services/downloadsService'

// Utils
export {
    formatBytes,
    formatSpeed,
    formatETA,
    getStateDisplay,
    calculateSummary,
} from './utils'

// Types
export type { Torrent, TorrentStateInfo, DownloadsSummary, TorrentActionResult } from './types'
