'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MovieCardProps {
    imdbID: string
    Title: string
    Year: string
    Poster: string
    Type: string
}

export default function MovieCard({ imdbID, Title, Year, Poster, Type }: MovieCardProps) {
    const [imageError, setImageError] = useState(false)
    const hasPoster = Poster && Poster !== 'N/A' && !imageError

    // Different colors for different types
    const getTypeBadgeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'movie':
                return 'bg-blue-900 text-blue-400'
            case 'series':
                return 'bg-green-900 text-green-400'
            case 'episode':
                return 'bg-purple-900 text-purple-400'
            case 'game':
                return 'bg-yellow-900 text-yellow-400'
            default:
                return 'bg-gray-900 text-gray-400'
        }
    }

    // Get icon for type
    const getTypeIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'movie':
                return '🎬'
            case 'series':
                return '📺'
            case 'episode':
                return '📹'
            case 'game':
                return '🎮'
            default:
                return '📄'
        }
    }

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
                        <span className={`text-xs uppercase px-2 py-1 rounded flex items-center gap-1 ${getTypeBadgeColor(Type)}`}>
                            <span>{getTypeIcon(Type)}</span>
                            {Type}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
