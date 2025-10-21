/**
 * TrailerPlayer Component
 * Display YouTube trailer in an embedded player
 */

'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface TrailerPlayerProps {
    title: string
    year?: string | number
    onClose?: () => void
}

interface TrailerData {
    videoId: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
}

export default function TrailerPlayer({ title, year, onClose }: TrailerPlayerProps) {
    const [trailer, setTrailer] = useState<TrailerData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadTrailer()
    }, [title, year])

    const loadTrailer = async () => {
        setLoading(true)
        setError(null)

        try {
            const params = new URLSearchParams({
                title: title
            })
            
            if (year) {
                params.append('year', year.toString())
            }

            const response = await axios.get(`${API_URL}/api/youtube/trailer?${params}`)
            setTrailer(response.data.trailer)
        } catch (err: any) {
            console.error('Failed to load trailer:', err)
            setError(err.response?.data?.error || 'Failed to load trailer')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading trailer...</p>
            </div>
        )
    }

    if (error || !trailer) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <span className="text-4xl mb-4 block">🎬</span>
                <p className="text-gray-400 mb-4">{error || 'No trailer available'}</p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Video Player */}
            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${trailer.videoId}?autoplay=1&rel=0`}
                    title={trailer.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>

            {/* Trailer Info */}
            <div className="p-4">
                <h3 className="text-white font-semibold mb-2">{trailer.title}</h3>
                <p className="text-sm text-gray-400 mb-2">
                    <span className="text-blue-400">{trailer.channelTitle}</span>
                    {' • '}
                    {new Date(trailer.publishedAt).toLocaleDateString()}
                </p>
                
                {onClose && (
                    <button
                        onClick={onClose}
                        className="mt-4 w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        Close Trailer
                    </button>
                )}
            </div>
        </div>
    )
}
