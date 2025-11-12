// Downloads Feature - useDownloadActions Hook
'use client'

import { downloadsService } from '../services/downloadsService'

export function useDownloadActions(onSuccess?: () => void) {
    const pause = async (hash: string, userId?: number): Promise<boolean> => {
        const result = await downloadsService.pauseTorrent(hash, userId)

        if (result.success) {
            onSuccess?.()
            return true
        } else {
            alert(result.error || 'Failed to pause torrent')
            return false
        }
    }

    const resume = async (hash: string, userId?: number): Promise<boolean> => {
        const result = await downloadsService.resumeTorrent(hash, userId)

        if (result.success) {
            onSuccess?.()
            return true
        } else {
            alert(result.error || 'Failed to resume torrent')
            return false
        }
    }

    const forceStart = async (hash: string, userId?: number): Promise<boolean> => {
        const result = await downloadsService.forceStartTorrent(hash, userId)

        if (result.success) {
            onSuccess?.()
            return true
        } else {
            alert(result.error || 'Failed to force start torrent')
            return false
        }
    }

    const deleteTorrent = async (
        hash: string,
        userId?: number
    ): Promise<boolean> => {
        // Show options modal for delete
        const action = window.prompt(
            'Delete torrent:\n\n' +
            '1 - Remove from list only (keep files)\n' +
            '2 - Delete torrent AND files\n' +
            '0 - Cancel\n\n' +
            'Enter your choice (0/1/2):',
            '1'
        )

        if (action === '0' || action === null) return false

        const deleteFiles = action === '2'

        const confirmMsg = deleteFiles
            ? '⚠️ Are you sure? This will DELETE ALL FILES from disk!'
            : 'Remove torrent from list? (files will be kept)'

        if (!confirm(confirmMsg)) return false

        const result = await downloadsService.deleteTorrent(hash, deleteFiles, userId)

        if (result.success) {
            onSuccess?.()
            return true
        } else {
            alert(result.error || 'Failed to delete torrent')
            return false
        }
    }

    return {
        pause,
        resume,
        forceStart,
        deleteTorrent,
    }
}
