// Torrents Feature - Torrent Details Hook
import { useState, useEffect } from 'react'
import { torrentsService } from '../services/torrentsService'
import type { TorrentDetails, Torrent } from '../types'

interface UseTorrentDetailsParams {
    id: string
    basicTorrent?: Torrent
}

export function useTorrentDetails({ id, basicTorrent }: UseTorrentDetailsParams) {
    const [torrent, setTorrent] = useState<TorrentDetails | null>(basicTorrent || null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadDetails()
    }, [id])

    const loadDetails = async () => {
        setLoading(true)
        setError('')

        try {
            // If we have basic torrent info, set it immediately
            if (basicTorrent) {
                setTorrent(basicTorrent)
            }

            // Fetch full details from backend if we have a valid ID
            if (id && id !== 'unknown') {
                try {
                    const details = await torrentsService.getTorrentDetails(id)
                    setTorrent(prev => ({ ...prev, ...details }))
                } catch (err) {
                    console.log('Could not fetch full details, using basic info only')
                    // If we already have basic torrent, don't show error
                    if (!basicTorrent) {
                        throw err
                    }
                }
            } else if (!basicTorrent) {
                throw new Error('Invalid torrent ID and no basic torrent data')
            }
        } catch (err: any) {
            console.error('Error loading torrent details:', err)
            setError(err.message || 'Failed to load torrent details')
        } finally {
            setLoading(false)
        }
    }

    const refresh = () => {
        loadDetails()
    }

    return {
        torrent,
        loading,
        error,
        refresh,
    }
}
