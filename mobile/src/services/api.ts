import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import NetInfo from '@react-native-community/netinfo'
import { storageService } from '../utils/storage'
import { offlineQueueManager } from '../utils/offlineQueue'
import { logger } from '../utils/logger'
import { ApiError } from '../types/common'
import ENV from '../config/env'

const API_BASE_URL = ENV.API_BASE_URL
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

interface RequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  _isRefreshing?: boolean
  _offline?: boolean
}

interface CachedRequest {
  promise: Promise<any>
  timestamp: number
}

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    onSuccess: (token: string) => void
    onError: (error: any) => void
  }> = []
  private requestCache = new Map<string, CachedRequest>() // Request deduplication
  private readonly DEDUP_WINDOW_MS = 100 // Deduplicate within 100ms window

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000, // Increased timeout for physical devices
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
    logger.debug('API Client initialized', { baseURL: API_BASE_URL })
  }

  /**
   * Generate cache key for request deduplication
   */
  private getCacheKey(method: string, endpoint: string, data?: any): string {
    return `${method}:${endpoint}:${JSON.stringify(data || {})}`
  }

  /**
   * Check if identical request was made recently and return cached promise
   */
  private checkRequestCache(method: string, endpoint: string, data?: any): CachedRequest | null {
    const key = this.getCacheKey(method, endpoint, data)
    const cached = this.requestCache.get(key)

    if (cached && Date.now() - cached.timestamp < this.DEDUP_WINDOW_MS) {
      logger.debug('Request deduplication hit', { key })
      return cached
    }

    // Clean up expired cache entry
    if (cached) {
      this.requestCache.delete(key)
    }

    return null
  }

  /**
   * Cache request promise for deduplication
   */
  private cacheRequest(method: string, endpoint: string, promise: Promise<any>, data?: any): void {
    const key = this.getCacheKey(method, endpoint, data)
    this.requestCache.set(key, { promise, timestamp: Date.now() })
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: RequestConfig) => {
        const token = await storageService.getItem<string>(TOKEN_KEY)
        if (token && !config._isRefreshing) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(this.handleError(error))
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as RequestConfig

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && config && !config._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({
                onSuccess: (token: string) => {
                  config.headers.Authorization = `Bearer ${token}`
                  resolve(this.client(config))
                },
                onError: (err) => {
                  reject(err)
                },
              })
            })
          }

          this.isRefreshing = true
          config._retry = true

          try {
            const refreshToken = await storageService.getItem<string>(REFRESH_TOKEN_KEY)
            if (!refreshToken) {
              // No refresh token available - this is expected if user just started app without being logged in
              // Silently clear auth and reject without logging (normal for fresh installs)
              await this.clearAuthData()
              this.failedQueue.forEach((prom) => prom.onError({ code: 'NO_REFRESH_TOKEN' }))
              this.failedQueue = []
              return Promise.reject({ code: 'NO_REFRESH_TOKEN', message: 'Not authenticated' })
            }

            const response = await this.client.post('/auth/refresh', { refreshToken }, { _isRefreshing: true } as RequestConfig)
            const { accessToken, refreshToken: newRefreshToken } = response.data

            await storageService.setItem(TOKEN_KEY, accessToken)
            if (newRefreshToken) {
              await storageService.setItem(REFRESH_TOKEN_KEY, newRefreshToken)
            }

            config.headers.Authorization = `Bearer ${accessToken}`

            this.failedQueue.forEach((prom) => prom.onSuccess(accessToken))
            this.failedQueue = []

            return this.client(config)
          } catch (err) {
            this.failedQueue.forEach((prom) => prom.onError(err))
            this.failedQueue = []

            // Clear auth data on refresh failure
            await this.clearAuthData()
            return Promise.reject(this.handleError(err))
          } finally {
            this.isRefreshing = false
          }
        }

        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: any): ApiError {
    // Don't log expected "no refresh token" errors
    if (error?.message === 'No refresh token available') {
      return {
        message: error.message,
        code: 'NO_REFRESH_TOKEN',
        status: 0,
      }
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 0
      const message = error.response?.data?.message || error.message || 'An error occurred'
      const code = error.code || 'UNKNOWN_ERROR'

      // Enhanced logging for network debugging
      logger.error('API Error', {
        status,
        message,
        code,
        baseURL: API_BASE_URL,
        url: error.config?.url,
        method: error.config?.method,
      })

      return {
        message,
        code,
        status,
        details: error.response?.data,
      }
    }

    // Log non-axios errors with full context
    logger.error('Unexpected error', {
      message: error?.message || String(error),
      baseURL: API_BASE_URL,
    })

    return {
      message: error.message || 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
    }
  }

  async get<T>(endpoint: string, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      // Check request deduplication cache
      const cached = this.checkRequestCache('GET', endpoint)
      if (cached) {
        return cached.promise
      }

      const promise = this.client.get<T>(endpoint, config).then((response) => response.data)
      this.cacheRequest('GET', endpoint, promise)
      return await promise
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async post<T>(endpoint: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      // Check request deduplication cache for idempotent read operations (like /search/suggestions)
      // Skip dedup for mutations or if explicitly disabled
      const skipDedup = (config as RequestConfig)?._skipDedup === true || endpoint.includes('/bookings') || endpoint.includes('/auth')
      if (!skipDedup) {
        const cached = this.checkRequestCache('POST', endpoint, data)
        if (cached) {
          return cached.promise
        }
      }

      const isOnline = await this.checkOnline()

      if (!isOnline && (config as RequestConfig)?._offline !== false) {
        // Queue the request for later
        const action = {
          id: `${Date.now()}-${Math.random()}`,
          endpoint,
          method: 'POST' as const,
          data,
          timestamp: Date.now(),
          retries: 0,
        }
        await offlineQueueManager.enqueue(action)
        logger.info('Request queued offline', { endpoint })
        throw {
          message: 'Request queued - will be sent when online',
          code: 'OFFLINE_QUEUED',
          status: 0,
        }
      }

      const promise = this.client.post<T>(endpoint, data, config).then((response) => response.data)
      if (!skipDedup) {
        this.cacheRequest('POST', endpoint, promise, data)
      }
      return await promise
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async put<T>(endpoint: string, data?: any, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const isOnline = await this.checkOnline()

      if (!isOnline && (config as RequestConfig)?._offline !== false) {
        const action = {
          id: `${Date.now()}-${Math.random()}`,
          endpoint,
          method: 'PUT' as const,
          data,
          timestamp: Date.now(),
          retries: 0,
        }
        await offlineQueueManager.enqueue(action)
        logger.info('Request queued offline', { endpoint })
        throw {
          message: 'Request queued - will be sent when online',
          code: 'OFFLINE_QUEUED',
          status: 0,
        }
      }

      const response = await this.client.put<T>(endpoint, data, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  async delete<T>(endpoint: string, config?: InternalAxiosRequestConfig): Promise<T> {
    try {
      const isOnline = await this.checkOnline()

      if (!isOnline && (config as RequestConfig)?._offline !== false) {
        const action = {
          id: `${Date.now()}-${Math.random()}`,
          endpoint,
          method: 'DELETE' as const,
          timestamp: Date.now(),
          retries: 0,
        }
        await offlineQueueManager.enqueue(action)
        logger.info('Request queued offline', { endpoint })
        throw {
          message: 'Request queued - will be sent when online',
          code: 'OFFLINE_QUEUED',
          status: 0,
        }
      }

      const response = await this.client.delete<T>(endpoint, config)
      return response.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  private async checkOnline(): Promise<boolean> {
    const state = await NetInfo.fetch()
    return !!(state.isConnected && state.isInternetReachable)
  }

  async setAuthToken(token: string, refreshToken?: string): Promise<void> {
    await storageService.setItem(TOKEN_KEY, token)
    if (refreshToken) {
      await storageService.setItem(REFRESH_TOKEN_KEY, refreshToken)
    }
  }

  async getAuthToken(): Promise<string | null> {
    return storageService.getItem<string>(TOKEN_KEY)
  }

  private async clearAuthData(): Promise<void> {
    await storageService.removeItem(TOKEN_KEY)
    await storageService.removeItem(REFRESH_TOKEN_KEY)
  }

  async logout(): Promise<void> {
    await this.clearAuthData()
  }
}

export const apiClient = new ApiClient()
