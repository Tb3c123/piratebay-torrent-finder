import React from 'react'

export interface CardProps {
    variant?: 'default' | 'bordered' | 'elevated'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    className?: string
    children: React.ReactNode
}

export interface CardHeaderProps {
    className?: string
    children: React.ReactNode
}

export interface CardBodyProps {
    className?: string
    children: React.ReactNode
}

export interface CardFooterProps {
    className?: string
    children: React.ReactNode
}

const Card: React.FC<CardProps> & {
    Header: React.FC<CardHeaderProps>
    Body: React.FC<CardBodyProps>
    Footer: React.FC<CardFooterProps>
} = ({ variant = 'default', padding = 'md', className = '', children }) => {
    const baseStyles = 'rounded-lg bg-gray-800 transition-all duration-200'
    
    const variantStyles = {
        default: '',
        bordered: 'border border-gray-700',
        elevated: 'shadow-lg'
    }
    
    const paddingStyles = {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6'
    }
    
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`
    
    return (
        <div className={combinedClassName}>
            {children}
        </div>
    )
}

const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
    return (
        <div className={`border-b border-gray-700 pb-3 mb-4 ${className}`}>
            {children}
        </div>
    )
}

const CardBody: React.FC<CardBodyProps> = ({ className = '', children }) => {
    return (
        <div className={className}>
            {children}
        </div>
    )
}

const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
    return (
        <div className={`border-t border-gray-700 pt-3 mt-4 ${className}`}>
            {children}
        </div>
    )
}

Card.Header = CardHeader
Card.Body = CardBody
Card.Footer = CardFooter

export default Card
