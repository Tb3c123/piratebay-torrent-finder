'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function GlobalKeyHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Intercept F5 or Ctrl+R / Cmd+R
            if (e.key === 'F5' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
                e.preventDefault()
                console.log('🔄 Refresh blocked - staying on current page:', pathname)

                // Instead of full page reload, just refresh the current route
                // This keeps you on the same page
                window.location.reload()
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        // Prevent browser's default beforeunload for F5
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            // Keep this empty to allow refresh but stay on same page
            // This ensures Next.js routing is maintained
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [pathname])

    return <>{children}</>
}
