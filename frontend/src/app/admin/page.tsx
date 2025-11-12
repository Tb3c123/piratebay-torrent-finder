'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAuthToken } from '@/lib/auth'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface User {
    id: number
    username: string
    is_admin: boolean
    created_at: string
}

export default function AdminPage() {
    const router = useRouter()
    const { user, isAdmin, loading: authLoading } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (!authLoading) {
            if (!user) {
                router.push('/auth/login')
            } else if (!isAdmin) {
                router.push('/')
            } else {
                fetchUsers()
            }
        }
    }, [user, isAdmin, authLoading, router])

    const fetchUsers = async () => {
        try {
            const token = getAuthToken()
            const response = await axios.get(`${API_URL}/api/v1/auth/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.data.success && response.data.data) {
                setUsers(response.data.data)
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: number) => {
        try {
            const token = getAuthToken()
            await axios.delete(`${API_URL}/api/v1/auth/admin/users/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            // Refresh users list
            fetchUsers()
            setDeleteConfirm(null)
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to delete user')
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                    <p className="text-gray-400">Loading admin panel...</p>
                </div>
            </div>
        )
    }

    if (!isAdmin) {
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <span className="text-yellow-500">👑</span>
                        Admin Panel
                    </h1>
                    <p className="text-gray-400">Manage users and system settings</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                    <div className="px-6 py-4 bg-gray-900 border-b border-gray-700">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            User Management
                            <span className="text-sm text-gray-400 font-normal ml-2">
                                ({users.length} {users.length === 1 ? 'user' : 'users'})
                            </span>
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900 border-b border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {u.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                                            {u.username}
                                            {u.id === user?.id && (
                                                <span className="ml-2 text-xs text-purple-400">(You)</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {u.is_admin ? (
                                                <span className="bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(u.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {u.id === 1 ? (
                                                <span className="text-gray-500 text-xs">Protected</span>
                                            ) : deleteConfirm === u.id ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setDeleteConfirm(u.id)}
                                                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                        💡 <strong>Note:</strong> The admin user (ID 1) cannot be deleted. All other users can be managed from this panel.
                    </p>
                </div>
            </div>
        </div>
    )
}
