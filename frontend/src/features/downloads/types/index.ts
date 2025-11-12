// Downloads Feature - Type Definitions

export interface Torrent {
    hash: string
    name: string
    size: number
    progress: number
    dlspeed: number
    upspeed: number
    downloaded: number
    uploaded: number
    eta: number
    state: string
    save_path: string
    added_on: number
    completion_on: number
    num_seeds: number
    num_leechs: number
    ratio: number
}

export interface TorrentStateInfo {
    text: string
    color: string
    icon: string
}

export interface DownloadsSummary {
    total: number
    downloading: number
    seeding: number
    paused: number
}

export interface TorrentActionResult {
    success: boolean
    error?: string
}
