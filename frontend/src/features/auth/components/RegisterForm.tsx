// Auth Feature - Register Form Component
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRegister } from '../hooks/useRegister'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Alert } from '@/components/ui'

export function RegisterForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { register, loading, error, success, setError } = useRegister()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    await register(
      { username, password, confirmPassword },
      async () => {
        await refreshUser()
      }
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
        <p className="text-gray-400 mb-4">
          Your account has been created successfully.
        </p>
        <p className="text-gray-500 text-sm">
          Redirecting to login page...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username */}
      <Input
        label="Username"
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose a username (min 3 characters)"
        required
        minLength={3}
        disabled={loading}
      />

      {/* Password */}
      <Input
        label="Password"
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Choose a password (min 6 characters)"
        required
        minLength={6}
        disabled={loading}
      />

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm your password"
        required
        minLength={6}
        disabled={loading}
      />

      {/* Error Message */}
      {error && (
        <Alert
          type="error"
          message={error}
          dismissible
          onDismiss={() => setError('')}
        />
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        Create Account
      </Button>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}
