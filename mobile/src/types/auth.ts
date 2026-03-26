export type UserRole = 'traveler' | 'business' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  isVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role: UserRole
  phone?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface AuthError {
  message: string
  code: string
}
