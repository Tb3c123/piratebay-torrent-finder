// Movies Feature - MovieCard Component
'use client'

import { useState, memo, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MovieCardProps {
    imdbID: string
    Title: string
    Year: string
    Poster: string
    Type: string
}

// Memoize badge colors calculation
const TYPE_BADGE_COLORS = {
    movie: 'bg-blue-900 text-blue-400',
    series: 'bg-green-900 text-green-400',
    episode: 'bg-purple-900 text-purple-400',
    game: 'bg-yellow-900 text-yellow-400',
    default: 'bg-gray-900 text-gray-400',
} as const

// Memoize type icons
const TYPE_ICONS = {
    movie: '🎬',
    series: '📺',
    episode: '📹',
    game: '🎮',
    default: '📄',
} as const

// Memoized MovieCard component
export const MovieCard = memo(function MovieCard({ imdbID, Title, Year, Poster, Type }: MovieCardProps) {
    const [imageError, setImageError] = useState(false)
    const hasPoster = Poster && Poster !== 'N/A' && !imageError

    // Memoize badge color calculation
    const badgeColor = useMemo(() => {
        const type = Type.toLowerCase() as keyof typeof TYPE_BADGE_COLORS
        return TYPE_BADGE_COLORS[type] || TYPE_BADGE_COLORS.default
    }, [Type])

    // Memoize icon selection
    const typeIcon = useMemo(() => {
        const type = Type.toLowerCase() as keyof typeof TYPE_ICONS
        return TYPE_ICONS[type] || TYPE_ICONS.default
    }, [Type])

    return (
        <Link href={`/movie/${imdbID}`}>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 cursor-pointer">
                <div className="relative h-96 w-full bg-gray-900">
                    {hasPoster ? (
                        <Image
                            src={Poster}
                            alt={Title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            priority={false}
                            onError={() => setImageError(true)}
                            unoptimized={true}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500 text-center p-4">
                                <svg className="w-20 h-20 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm">No Poster</p>
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-white font-semibold text-lg truncate" title={Title}>
                        {Title}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-400 text-sm">{Year}</span>
                        <span className={`text-xs uppercase px-2 py-1 rounded flex items-center gap-1 ${badgeColor}`}>
                            <span>{typeIcon}</span>
                            {Type}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
})
