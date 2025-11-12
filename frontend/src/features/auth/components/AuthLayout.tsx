// Auth Feature - Auth Layout Component
'use client'

import { ReactNode } from 'react'
import { useCheckUsers } from '../hooks/useCheckUsers'
import { Alert } from '@/components/ui'

interface AuthLayoutProps {
    children: ReactNode
    title?: string
    subtitle?: string
}

export function AuthLayout({
    children,
    title = '🏴‍☠️ Pirate Bay Finder',
    subtitle = 'Sign in to your account'
}: AuthLayoutProps) {
    const { hasUser } = useCheckUsers()

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-400">{subtitle}</p>
                </div>

                {/* Form Container */}
                <div className="bg-gray-800 rounded-lg shadow-2xl p-8">
                    {children}
                </div>

                {/* Info Message */}
                {hasUser === false && (
                    <div className="mt-6">
                        <Alert
                            type="info"
                            message="💡 First user registered will automatically become the admin"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
