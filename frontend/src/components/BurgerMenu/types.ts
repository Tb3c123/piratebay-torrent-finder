/**
 * BurgerMenu Types
 * Shared type definitions for BurgerMenu components
 */

export interface SearchHistoryItem {
    id?: number
    query: string
    timestamp: number | string
    type?: 'movie' | 'anime'
    category?: string
    resultCount?: number
}

export type MenuView = 'main' | 'fullHistory'

export interface BurgerMenuState {
    isOpen: boolean
    currentView: MenuView
    searchHistory: SearchHistoryItem[]
    loadingHistory: boolean
    displayedHistory: SearchHistoryItem[]
    page: number
    hasMore: boolean
    loadingMore: boolean
}
