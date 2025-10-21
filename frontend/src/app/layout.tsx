import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import BurgerMenu from '@/components/BurgerMenu'
import Header from '@/components/Header'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Pirate Bay Torrent Finder',
    description: 'Search and download torrents with qBittorrent integration',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <AuthProvider>
                    {/* Burger Menu - Outside header to avoid z-index stacking context issues */}
                    <BurgerMenu />

                    {/* Fixed Header */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
                        <div className="container mx-auto pl-16 pr-4 py-4 flex items-center">
                            <Header />
                        </div>
                    </header>

                    {/* Main Content with padding to avoid header overlap */}
                    <main className="pt-16">
                        <ErrorBoundary>
                            {children}
                        </ErrorBoundary>
                    </main>
                </AuthProvider>
            </body>
        </html>
    )
}
