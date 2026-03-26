import { create } from 'zustand'
import { Favorite } from '../types/favorite'
import { favoriteService } from '../services/favoriteService'
import { logger } from '../utils/logger'

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) return error.message
  return fallback
}

const isNotFoundError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false
  const maybeStatus = (error as { status?: number }).status
  const maybeCode = (error as { code?: string }).code
  return maybeStatus === 404 || maybeCode === 'NOT_FOUND'
}

export interface FavoriteState {
  favorites: Favorite[]
  isLoading: boolean
  error: string | null
  favoriteActivityIds: Set<string>

  // Actions
  loadFavorites: () => Promise<void>
  addFavorite: (activityId: string) => Promise<void>
  removeFavorite: (activityId: string) => Promise<void>
  isFavorited: (activityId: string) => boolean
  reset: () => void
  clearError: () => void
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  isLoading: false,
  error: null,
  favoriteActivityIds: new Set<string>(),

  loadFavorites: async () => {
    set({ isLoading: true, error: null })
    try {
      const favoritesResponse = await favoriteService.getFavorites()
      const favorites = Array.isArray(favoritesResponse) ? favoritesResponse : []
      const activityIds = new Set(favorites.map((f) => f.activityId))
      set({ favorites, favoriteActivityIds: activityIds, isLoading: false })
      logger.info('Favorites loaded', { count: favorites.length })
    } catch (error: unknown) {
      if (isNotFoundError(error)) {
        set({ favorites: [], favoriteActivityIds: new Set(), isLoading: false, error: null })
        logger.warn('Favorites endpoint not available, using empty state')
        return
      }

      const message = getErrorMessage(error, 'Failed to load favorites')
      set({ error: message, isLoading: false })
      logger.error('Failed to load favorites', error)
    }
  },

  addFavorite: async (activityId: string) => {
    set({ error: null })
    try {
      const favorite = await favoriteService.addFavorite(activityId)
      const favoriteActivityIds = new Set(get().favoriteActivityIds)
      favoriteActivityIds.add(activityId)
      set({
        favorites: [...get().favorites, favorite],
        favoriteActivityIds,
      })
      logger.info('Favorite added', { activityId })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to add favorite')
      set({ error: message })
      logger.error('Failed to add favorite', error)
    }
  },

  removeFavorite: async (activityId: string) => {
    set({ error: null })
    try {
      await favoriteService.removeFavorite(activityId)
      const favorites = get().favorites.filter((f) => f.activityId !== activityId)
      const favoriteActivityIds = new Set(get().favoriteActivityIds)
      favoriteActivityIds.delete(activityId)
      set({ favorites, favoriteActivityIds })
      logger.info('Favorite removed', { activityId })
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to remove favorite')
      set({ error: message })
      logger.error('Failed to remove favorite', error)
    }
  },

  isFavorited: (activityId: string) => {
    return get().favoriteActivityIds.has(activityId)
  },

  reset: () => {
    set({ favorites: [], favoriteActivityIds: new Set(), error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
