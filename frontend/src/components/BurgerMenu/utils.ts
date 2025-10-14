/**
 * BurgerMenu Utilities
 * Helper functions for BurgerMenu components
 */

import { SearchHistoryItem } from './types'

/**
 * Groups search history items by date
 * @param items - Array of search history items
 * @returns Object with date strings as keys and arrays of items as values
 */
export const groupByDate = (items: SearchHistoryItem[]) => {
    const groups: { [key: string]: SearchHistoryItem[] } = {}

    items.forEach(item => {
        const date = new Date(item.timestamp)
        const dateKey = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        if (!groups[dateKey]) {
            groups[dateKey] = []
        }
        groups[dateKey].push(item)
    })

    return groups
}

/**
 * Formats timestamp to time string
 * @param timestamp - Unix timestamp or date string
 * @returns Formatted time string (e.g., "3:45 PM")
 */
export const formatTime = (timestamp: number | string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
}

/**
 * Formats timestamp to full date string
 * @param timestamp - Unix timestamp or date string
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number | string): string => {
    return new Date(timestamp).toLocaleString()
}
