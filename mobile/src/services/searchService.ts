import { apiClient } from './api'
import {
  SearchFiltersRequest,
  SearchResultsResponse,
  SearchSuggestionsResponse,
  SearchMetadata,
  Activity,
} from '../types/search'
import { storageService } from '../utils/storage'

const METADATA_CACHE_KEY = 'search_metadata'
const METADATA_CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedMetadata {
  data: SearchMetadata
  timestamp: number
}

class SearchService {
  async loadMetadata(): Promise<SearchMetadata> {
    const cached = await this.getCachedMetadata()
    if (cached) {
      return cached
    }

    const metadata = await apiClient.get<SearchMetadata>('/search/metadata')
    await this.cacheMetadata(metadata)
    return metadata
  }

  async getSuggestions(query: string, type: 'city' | 'category'): Promise<SearchSuggestionsResponse> {
    return apiClient.get<SearchSuggestionsResponse>(`/search/suggestions?query=${query}&type=${type}`)
  }

  async searchActivities(filters: SearchFiltersRequest): Promise<SearchResultsResponse> {
    return apiClient.post<SearchResultsResponse>('/search/filters', filters)
  }

  async getActivityById(id: string): Promise<Activity> {
    return apiClient.get<Activity>(`/activities/${id}`)
  }

  private async getCachedMetadata(): Promise<SearchMetadata | null> {
    try {
      const cached = await storageService.getItem<CachedMetadata>(METADATA_CACHE_KEY)
      if (!cached) return null

      const isExpired = Date.now() - cached.timestamp > METADATA_CACHE_TTL
      if (isExpired) {
        await storageService.removeItem(METADATA_CACHE_KEY)
        return null
      }

      return cached.data
    } catch (error) {
      console.error('Failed to get cached metadata', error)
      return null
    }
  }

  private async cacheMetadata(data: SearchMetadata): Promise<void> {
    try {
      const cached: CachedMetadata = {
        data,
        timestamp: Date.now(),
      }
      await storageService.setItem(METADATA_CACHE_KEY, cached)
    } catch (error) {
      console.error('Failed to cache metadata', error)
    }
  }

  async clearMetadataCache(): Promise<void> {
    await storageService.removeItem(METADATA_CACHE_KEY)
  }
}

export const searchService = new SearchService()
