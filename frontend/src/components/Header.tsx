'use client'

import { useRouter } from 'next/navigation'

export default function Header() {
    const router = useRouter()

    const handleLogoClick = () => {
        router.push('/')
    }

    return (
        <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
            <span className="text-3xl">🏴‍☠️</span>
            <div className="text-left">
                <h1 className="text-xl font-bold text-white">Pirate Bay Finder</h1>
                <p className="text-xs text-gray-400">Movie & Torrent Search</p>
            </div>
        </button>
    )
}
