// Settings Feature - SettingsCard Component
'use client'

import { ReactNode } from 'react'

interface SettingsCardProps {
  icon?: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

export function SettingsCard({
  icon,
  title,
  description,
  children,
  className = '',
}: SettingsCardProps) {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {icon && <span className="text-2xl">{icon}</span>}
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {description && (
            <p className="text-sm text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
