'use client'

import { useState } from 'react'

export interface CategoryFilter {
    id: string
    name: string
    icon: string
}

export const PIRATEBAY_CATEGORIES: CategoryFilter[] = [
    { id: '0', name: 'All', icon: '🌐' },
    { id: '100', name: 'Audio', icon: '🎵' },
    { id: '101', name: 'Music', icon: '🎼' },
    { id: '102', name: 'Audio Books', icon: '📻' },
    { id: '200', name: 'Video', icon: '🎬' },
    { id: '201', name: 'Movies', icon: '🎥' },
    { id: '202', name: 'Movies DVDR', icon: '💿' },
    { id: '203', name: 'Music Videos', icon: '🎤' },
    { id: '204', name: 'Movie Clips', icon: '🎞️' },
    { id: '205', name: 'TV Shows', icon: '📺' },
    { id: '206', name: 'Handheld', icon: '📱' },
    { id: '207', name: 'HD - Movies', icon: '🎬' },
    { id: '208', name: 'HD - TV Shows', icon: '📺' },
    { id: '209', name: '3D', icon: '🕶️' },
    { id: '299', name: 'Other Video', icon: '📹' },
    { id: '300', name: 'Applications', icon: '💻' },
    { id: '301', name: 'Windows', icon: '🪟' },
    { id: '302', name: 'Mac', icon: '🍎' },
    { id: '303', name: 'UNIX', icon: '🐧' },
    { id: '304', name: 'Handheld', icon: '📱' },
    { id: '305', name: 'IOS (iPad/iPhone)', icon: '📱' },
    { id: '306', name: 'Android', icon: '🤖' },
    { id: '399', name: 'Other OS', icon: '💾' },
    { id: '400', name: 'Games', icon: '🎮' },
    { id: '401', name: 'PC', icon: '🖥️' },
    { id: '402', name: 'Mac', icon: '🍎' },
    { id: '403', name: 'PSx', icon: '🎮' },
    { id: '404', name: 'XBOX360', icon: '🎮' },
    { id: '405', name: 'Wii', icon: '🎮' },
    { id: '406', name: 'Handheld', icon: '🕹️' },
    { id: '407', name: 'IOS (iPad/iPhone)', icon: '📱' },
    { id: '408', name: 'Android', icon: '🤖' },
    { id: '499', name: 'Other Games', icon: '🎯' },
    { id: '500', name: 'Porn', icon: '🔞' },
    { id: '501', name: 'Movies', icon: '🎥' },
    { id: '502', name: 'Movies DVDR', icon: '💿' },
    { id: '503', name: 'Pictures', icon: '🖼️' },
    { id: '504', name: 'Games', icon: '🎮' },
    { id: '505', name: 'HD - Movies', icon: '🎬' },
    { id: '506', name: 'Movie Clips', icon: '🎞️' },
    { id: '599', name: 'Other Porn', icon: '🔞' },
    { id: '600', name: 'Other', icon: '📦' },
    { id: '601', name: 'E-books', icon: '📚' },
    { id: '602', name: 'Comics', icon: '📖' },
    { id: '603', name: 'Pictures', icon: '🖼️' },
    { id: '604', name: 'Covers', icon: '🎨' },
    { id: '605', name: 'Physibles', icon: '🏺' },
    { id: '699', name: 'Other Other', icon: '📦' },
]

// Popular categories for quick access
export const POPULAR_CATEGORIES: CategoryFilter[] = [
    { id: '0', name: 'All', icon: '🌐' },
    { id: '200', name: 'Video', icon: '🎬' },
    { id: '201', name: 'Movies', icon: '🎥' },
    { id: '205', name: 'TV Shows', icon: '📺' },
    { id: '207', name: 'HD Movies', icon: '🎬' },
    { id: '208', name: 'HD TV Shows', icon: '📺' },
    { id: '100', name: 'Audio', icon: '🎵' },
    { id: '300', name: 'Applications', icon: '💻' },
    { id: '400', name: 'Games', icon: '🎮' },
    { id: '601', name: 'E-books', icon: '📚' },
]

interface CategoryFilterProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export default function CategoryFilterComponent({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    const [showAllCategories, setShowAllCategories] = useState(false)

    const displayCategories = showAllCategories ? PIRATEBAY_CATEGORIES : POPULAR_CATEGORIES

    return (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    🔍 Filter by Category
                </h3>
                <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    {showAllCategories ? '← Show Popular' : 'Show All →'}
                </button>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {displayCategories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`
                            p-3 rounded-lg transition-all duration-200
                            flex flex-col items-center justify-center gap-1
                            ${selectedCategory === category.id
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                            }
                        `}
                    >
                        <span className="text-2xl">{category.icon}</span>
                        <span className="text-xs font-medium text-center leading-tight">
                            {category.name}
                        </span>
                    </button>
                ))}
            </div>

            {/* Active Filter Display */}
            {selectedCategory !== '0' && (
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-400">Active filter:</span>
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-2">
                        {PIRATEBAY_CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                        {PIRATEBAY_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                        <button
                            onClick={() => onCategoryChange('0')}
                            className="ml-1 hover:bg-blue-700 rounded-full w-5 h-5 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </span>
                </div>
            )}

            {/* Info Text */}
            <p className="mt-4 text-xs text-gray-500">
                Showing {showAllCategories ? PIRATEBAY_CATEGORIES.length : POPULAR_CATEGORIES.length} categories
                {!showAllCategories && ' (popular)'}
            </p>
        </div>
    )
}
