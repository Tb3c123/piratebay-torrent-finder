// Torrents Feature - Central Exports

// Components
export { CategoryFilter, PIRATEBAY_CATEGORIES, POPULAR_CATEGORIES } from './components/CategoryFilter'
export { TorrentSearchBar } from './components/TorrentSearchBar'
export { TorrentCard } from './components/TorrentCard'
export { TorrentList } from './components/TorrentList'
export { TorrentSection } from './components/TorrentSection'
export { AlternativeSearch } from './components/AlternativeSearch'

// Hooks
export { useTorrentSearch } from './hooks/useTorrentSearch'
export { useTorrentDetails } from './hooks/useTorrentDetails'

// Services
export { torrentsService } from './services/torrentsService'

// Types
export type {
    Torrent,
    TorrentDetails,
    TorrentFile,
    TorrentComment,
    TorrentSearchParams,
    TorrentSearchResult,
} from './types'
