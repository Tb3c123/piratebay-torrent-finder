// Auth Feature - Type Definitions

export interface User {
  id: number
  username: string
  is_admin: boolean
  created_at: string
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  error?: string
  message?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  password: string
  confirmPassword?: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  loading: boolean
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}
