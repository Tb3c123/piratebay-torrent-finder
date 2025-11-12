'use client'

import { AuthLayout, RegisterForm } from '@/features/auth'

export default function RegisterPage() {
    return (
        <AuthLayout
            title="🏴‍☠️ Pirate Bay Finder"
            subtitle="Create your account"
        >
            <RegisterForm />
        </AuthLayout>
    )
}
