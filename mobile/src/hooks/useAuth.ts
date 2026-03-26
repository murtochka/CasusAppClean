import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, isAuthenticated, isLoading, error, initAuth, login, register, logout, clearError, setUser } =
    useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    setUser,
  }
}
