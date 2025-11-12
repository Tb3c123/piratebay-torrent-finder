// Auth Feature - Login Form Component
'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useLogin } from '../hooks/useLogin'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Alert } from '@/components/ui'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, setError } = useLogin()
  const { refreshUser } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    await login(
      { username, password },
      async () => {
        await refreshUser()
      }
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
        placeholder="Enter your username"
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
        placeholder="Enter your password"
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
        Sign In
      </Button>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link
            href="/auth/register"
            className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </form>
  )
}
