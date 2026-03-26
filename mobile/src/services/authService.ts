import { apiClient } from './api'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth'

class AuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data)
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', data)
  }

  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/auth/me')
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh', { refreshToken })
  }

  async logout(): Promise<void> {
    await apiClient.logout()
  }
}

export const authService = new AuthService()
