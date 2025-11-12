import React from 'react'

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    color?: 'primary' | 'white' | 'gray'
    className?: string
    text?: string
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 'md',
    color = 'primary',
    className = '',
    text
}) => {
    const sizeStyles = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    const colorStyles = {
        primary: 'border-blue-500',
        white: 'border-white',
        gray: 'border-gray-400'
    }

    const spinnerClassName = `inline-block animate-spin rounded-full border-2 border-t-transparent ${sizeStyles[size]} ${colorStyles[color]} ${className}`

    if (text) {
        return (
            <div className="flex items-center gap-3">
                <div className={spinnerClassName} role="status" aria-label="Loading" />
                <span className="text-gray-300">{text}</span>
            </div>
        )
    }

    return <div className={spinnerClassName} role="status" aria-label="Loading" />
}

export default Spinner
