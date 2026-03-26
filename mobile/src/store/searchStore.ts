import { create } from 'zustand'
import { SearchFiltersRequest, SearchMetadata, ActivityWithGuide } from '../types/search'
import { searchService } from '../services/searchService'
import { logger } from '../utils/logger'

export interface SearchState {
  metadata: SearchMetadata | null
  results: ActivityWithGuide[]
  filters: SearchFiltersRequest
  pagination: { limit: number; offset: number; total: number }
  isLoading: boolean
  error: string | null

  // Actions
  loadMetadata: () => Promise<void>
  search: (filters: SearchFiltersRequest) => Promise<void>
  setFilters: (filters: SearchFiltersRequest) => void
  resetFilters: () => void
  loadMore: () => Promise<void>
  reset: () => void
  clearError: () => void
}

const defaultFilters: SearchFiltersRequest = {
  limit: 20,
  offset: 0,
}

const defaultPagination = { limit: 20, offset: 0, total: 0 }

export const useSearchStore = create<SearchState>((set, get) => ({
  metadata: null,
  results: [],
  filters: defaultFilters,
  pagination: defaultPagination,
  isLoading: false,
  error: null,

  loadMetadata: async () => {
    try {
      const metadata = await searchService.loadMetadata()
      set({ metadata, error: null })
      logger.info('Search metadata loaded', { cities: metadata.cities.length })
    } catch (error: any) {
      const message = error.message || 'Failed to load metadata'
      set({ error: message })
      logger.error('Failed to load metadata', error)
    }
  },

  search: async (filters: SearchFiltersRequest) => {
    set({ isLoading: true, error: null })
    try {
      const searchFilters = {
        ...filters,
        limit: filters.limit || 20,
        offset: 0,
      }
      const response = await searchService.searchActivities(searchFilters)
      set({
        results: response.activities,
        pagination: {
          limit: response.limit,
          offset: response.offset,
          total: response.total,
        },
        filters: searchFilters,
        isLoading: false,
        error: null,
      })
      logger.info('Search completed', { results: response.activities.length })
    } catch (error: any) {
      const message = error.message || 'Search failed'
      set({ error: message, isLoading: false })
      logger.error('Search failed', error)
    }
  },

  setFilters: (filters: SearchFiltersRequest) => {
    set({ filters: { ...get().filters, ...filters } })
  },

  resetFilters: () => {
    set({
      filters: defaultFilters,
      results: [],
      pagination: defaultPagination,
      error: null,
    })
  },

  loadMore: async () => {
    const state = get()
    const { pagination, filters, isLoading } = state

    // Prevent duplicate requests
    if (isLoading) {
      return
    }

    if (pagination.offset + pagination.limit >= pagination.total) {
      return // Already loaded all results
    }

    set({ isLoading: true })
    try {
      const newOffset = pagination.offset + pagination.limit
      const response = await searchService.searchActivities({
        ...filters,
        offset: newOffset,
      })

      set({
        results: [...state.results, ...response.activities],
        pagination: {
          limit: response.limit,
          offset: response.offset,
          total: response.total,
        },
        isLoading: false,
      })
      logger.info('More results loaded', { count: response.activities.length })
    } catch (error: any) {
      const message = error.message || 'Failed to load more'
      set({ error: message, isLoading: false })
      logger.error('Load more failed', error)
    }
  },

  reset: () => {
    set({
      metadata: null,
      results: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      error: null,
    })
  },

  clearError: () => {
    set({ error: null })
  },
}))
