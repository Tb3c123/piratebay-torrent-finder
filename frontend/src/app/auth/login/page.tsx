
'use client'

import { AuthLayout, LoginForm } from '@/features/auth'

export default function LoginPage() {
  return (
    <AuthLayout
      title="🏴‍☠️ Pirate Bay Finder"
      subtitle="Sign in to your account"
    >
      <LoginForm />
    </AuthLayout>
  )
}
