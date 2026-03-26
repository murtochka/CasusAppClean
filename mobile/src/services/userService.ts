import { apiClient } from './api'
import { User } from '../types/auth'

interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  avatarUrl?: string
}

interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

class UserService {
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>('/users/profile', data)
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/users/change-password', data)
  }

  async uploadAvatar(formData: FormData): Promise<{ url: string }> {
    // Note: Content-Type will be set automatically by the browser/axios for FormData
    return apiClient.post<{ url: string }>('/files/upload', formData)
  }

  async deleteFile(publicId: string): Promise<void> {
    await apiClient.delete(`/files/${publicId}`)
  }
}

export const userService = new UserService()
