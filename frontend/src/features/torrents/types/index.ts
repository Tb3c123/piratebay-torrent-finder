// Torrents Feature - Type Definitions

export interface Torrent {
    id: string
    title: string
    magnetLink: string
    size: string
    uploaded: string
    seeders: number
    leechers: number
    detailsUrl: string | null
    category?: string
    username?: string
    status?: string
    infoHash?: string
    imdb?: string | null
}

export interface TorrentDetails extends Torrent {
    description?: string
    info?: Record<string, string>
    files?: TorrentFile[]
    comments?: TorrentComment[]
}

export interface TorrentFile {
    name: string
    size: string
}

export interface TorrentComment {
    user: string
    date: string
    text: string
}

export interface TorrentSearchParams {
    query: string
    category?: string
    page?: number
}

export interface TorrentSearchResult {
    torrents: Torrent[]
    hasMore: boolean
}
