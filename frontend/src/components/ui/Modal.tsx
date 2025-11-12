'use client'

import React, { useEffect } from 'react'

export interface ModalProps {
    isOpen: boolean
    onClose: () => void
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    title?: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
    closeOnBackdrop?: boolean
    showCloseButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    size = 'md',
    title,
    children,
    footer,
    className = '',
    closeOnBackdrop = true,
    showCloseButton = true
}) => {
    // Handle ESC key press
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden'
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const sizeStyles = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4'
    }

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={handleBackdropClick}
        >
            <div
                className={`relative w-full ${sizeStyles[size]} bg-gray-800 rounded-lg shadow-2xl border border-gray-700 animate-scaleIn ${className}`}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                        {title && (
                            <h2 className="text-xl font-bold text-white">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                                aria-label="Close modal"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Modal
