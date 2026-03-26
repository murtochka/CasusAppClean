import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, AuthError } from '../types/auth'
import { authService } from '../services/authService'
import { apiClient } from '../services/api'
import { storageService } from '../utils/storage'
import { logger } from '../utils/logger'

const STORAGE_TIMEOUT_MS = 2000
const STORAGE_TIMEOUT = Symbol('storage-timeout')

export interface Metadata {
  cities: string[]
  categories: Array<{ id: string; name: string }>
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  _initAuthCalled?: boolean  // Internal flag to prevent multiple initAuth calls
  
  // Metadata for search and filtering
  metadata: Metadata
  metadataReady: boolean

  // Actions
  initAuth: () => Promise<void>
  loadMetadata: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string, role: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _initAuthCalled: false,
      metadata: { cities: [], categories: [] },
      metadataReady: false,

      loadMetadata: async () => {
        try {
          const response = await apiClient.get('/search/metadata')
          const { cities = [], categories = [] } = response.data || {}
          set({ metadata: { cities, categories }, metadataReady: true })
          logger.info('Metadata loaded', { cities: cities.length, categories: categories.length })
        } catch (error) {
          logger.warn('Failed to load metadata', error)
          // Gracefully continue even if metadata fails to load
          set({ metadataReady: true })
        }
      },

      initAuth: async () => {
        // Prevent running initAuth multiple times
        if (get()._initAuthCalled) {
          console.log('[STORAGE] initAuth already called, skipping')
          logger.info('initAuth already called, skipping')
          return
        }

        console.log('[STORAGE] initAuth: Starting authentication initialization')
        set({ _initAuthCalled: true, isLoading: true })
        try {
          // Check if we have a stored token before attempting to verify
          console.log('[STORAGE] Reading auth_token from AsyncStorage...')
          const storageStartTime = Date.now()
          const storedTokenResult = await Promise.race<
            string | null | typeof STORAGE_TIMEOUT
          >([
            storageService.getItem<string>('auth_token'),
            new Promise<typeof STORAGE_TIMEOUT>((resolve) =>
              setTimeout(() => resolve(STORAGE_TIMEOUT), STORAGE_TIMEOUT_MS)
            ),
          ])

          const storedToken =
            storedTokenResult === STORAGE_TIMEOUT ? null : storedTokenResult
          const storageElapsed = Date.now() - storageStartTime

          if (storedTokenResult === STORAGE_TIMEOUT) {
            console.error(
              `[STORAGE] ❌ AsyncStorage read timed out after ${STORAGE_TIMEOUT_MS}ms, continuing as logged out`
            )
            logger.warn('AsyncStorage read timeout during initAuth', {
              timeoutMs: STORAGE_TIMEOUT_MS,
            })
          }

          console.log(`[STORAGE] AsyncStorage read completed in ${storageElapsed}ms, token exists: ${!!storedToken}`)
          
          // If no token exists, skip verification - user is not logged in
          if (!storedToken) {
            console.log('[STORAGE] No stored token found, setting isAuthenticated=false, isLoading=false')
            set({ user: null, isAuthenticated: false, isLoading: false, error: null })
            logger.info('Auth check: no stored token, user not authenticated')
            return
          }

          console.log('[STORAGE] Token found, verifying with backend...')

          // Add 5 second timeout to auth check to avoid indefinite waiting
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
          )
          
          const authStartTime = Date.now()
          const user = await Promise.race([
            authService.getCurrentUser(),
            timeoutPromise,
          ]) as any
          const authElapsed = Date.now() - authStartTime
          
          console.log(`[STORAGE] Auth verification successful in ${authElapsed}ms, setting isAuthenticated=true, isLoading=false`)
          set({ user, isAuthenticated: true, error: null, isLoading: false })
          logger.info('Auth initialized', { userId: user.id })
        } catch (error: any) {
          console.error('[STORAGE] ❌ Auth initialization error:', error.message)
          logger.debug('Auth verification failed, user not authenticated', error)
          // Set as unauthenticated but don't show error - will allow user to login/retry
          set({ user: null, isAuthenticated: false, isLoading: false, error: null })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password })
          await apiClient.setAuthToken(response.accessToken, response.refreshToken)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
          logger.info('User logged in', { userId: response.user.id })
        } catch (error: any) {
          const authError: AuthError = {
            message: error.message || 'Login failed',
            code: error.code || 'LOGIN_ERROR',
          }
          set({ error: authError, isLoading: false })
          logger.error('Login failed', error)
          throw authError
        }
      },

      register: async (email: string, password: string, fullName: string, role: string, phone?: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.register({
            email,
            password,
            fullName,
            role: role as any,
            phone,
          })
          await apiClient.setAuthToken(response.accessToken, response.refreshToken)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
          logger.info('User registered', { userId: response.user.id })
        } catch (error: any) {
          const authError: AuthError = {
            message: error.message || 'Registration failed',
            code: error.code || 'REGISTER_ERROR',
          }
          set({ error: authError, isLoading: false })
          logger.error('Registration failed', error)
          throw authError
        }
      },

      logout: async () => {
        try {
          await authService.logout()
          set({ user: null, isAuthenticated: false, error: null, _initAuthCalled: false })
          await storageService.clear()
          logger.info('User logged out')
        } catch (error) {
          logger.error('Logout failed', error)
        }
      },

      clearError: () => {
        set({ error: null })
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: async (name: string) => {
          console.log(`[STORAGE] Zustand persist: Reading '${name}' from storage...`)
          try {
            const itemResult = await Promise.race<
              string | null | typeof STORAGE_TIMEOUT
            >([
              storageService.getItem<string>(name),
              new Promise<typeof STORAGE_TIMEOUT>((resolve) =>
                setTimeout(() => resolve(STORAGE_TIMEOUT), STORAGE_TIMEOUT_MS)
              ),
            ])

            if (itemResult === STORAGE_TIMEOUT) {
              console.error(
                `[STORAGE] ❌ Zustand persist: Timed out reading '${name}' after ${STORAGE_TIMEOUT_MS}ms`
              )
              logger.warn('Zustand persist storage read timeout', {
                key: name,
                timeoutMs: STORAGE_TIMEOUT_MS,
              })
              return null
            }

            const item = itemResult
            if (item) {
              console.log(`[STORAGE] Zustand persist: Found data for '${name}', parsing JSON...`)
              try {
                const parsed = JSON.parse(item)
                console.log(`[STORAGE] Zustand persist: Successfully parsed '${name}'`)
                return parsed
              } catch (parseError) {
                console.error(
                  `[STORAGE] ❌ Zustand persist: Corrupted JSON for '${name}', clearing persisted value`,
                  parseError
                )
                logger.warn('Zustand persist corrupted payload cleared', {
                  key: name,
                })
                await storageService.removeItem(name)
                return null
              }
            }
            console.log(`[STORAGE] Zustand persist: No data found for '${name}'`)
            return null
          } catch (error) {
            console.error(`[STORAGE] ❌ Zustand persist: Error reading '${name}':`, error)
            return null
          }
        },
        setItem: async (name: string, value: any) => {
          await storageService.setItem(name, JSON.stringify(value))
        },
        removeItem: async (name: string) => {
          await storageService.removeItem(name)
        },
      },
    }
  )
)
