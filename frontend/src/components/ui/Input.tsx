import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    containerClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            helperText,
            leftIcon,
            rightIcon,
            className = '',
            containerClassName = '',
            disabled = false,
            ...props
        },
        ref
    ) => {
        const baseInputStyles = 'w-full rounded-lg border bg-gray-800 text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2'
        
        const paddingStyles = leftIcon 
            ? 'pl-10 pr-4 py-2.5' 
            : rightIcon 
            ? 'pl-4 pr-10 py-2.5' 
            : 'px-4 py-2.5'
        
        const stateStyles = error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-700 focus:ring-blue-500 focus:border-blue-500'
        
        const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

        const inputClassName = `${baseInputStyles} ${paddingStyles} ${stateStyles} ${disabledStyles} ${className}`

        return (
            <div className={`w-full ${containerClassName}`}>
                {label && (
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {label}
                    </label>
                )}
                
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    
                    <input
                        ref={ref}
                        disabled={disabled}
                        className={inputClassName}
                        {...props}
                    />
                    
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                
                {error && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </p>
                )}
                
                {!error && helperText && (
                    <p className="mt-1.5 text-sm text-gray-400">
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export default Input
