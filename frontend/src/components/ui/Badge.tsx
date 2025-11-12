import React from 'react'

export interface BadgeProps {
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'
    size?: 'sm' | 'md' | 'lg'
    icon?: React.ReactNode
    children: React.ReactNode
    className?: string
}

const Badge: React.FC<BadgeProps> = ({
    color = 'gray',
    size = 'md',
    icon,
    children,
    className = ''
}) => {
    const baseStyles = 'inline-flex items-center gap-1 font-medium rounded-full'
    
    const colorStyles = {
        blue: 'bg-blue-900/50 text-blue-300 border border-blue-700',
        green: 'bg-green-900/50 text-green-300 border border-green-700',
        yellow: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
        red: 'bg-red-900/50 text-red-300 border border-red-700',
        gray: 'bg-gray-800 text-gray-300 border border-gray-700',
        purple: 'bg-purple-900/50 text-purple-300 border border-purple-700'
    }
    
    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
        lg: 'px-3 py-1.5 text-base'
    }
    
    const iconSizeStyles = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    }
    
    const combinedClassName = `${baseStyles} ${colorStyles[color]} ${sizeStyles[size]} ${className}`
    
    return (
        <span className={combinedClassName}>
            {icon && (
                <span className={iconSizeStyles[size]}>
                    {icon}
                </span>
            )}
            {children}
        </span>
    )
}

export default Badge
