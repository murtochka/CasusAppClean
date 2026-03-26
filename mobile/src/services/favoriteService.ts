import { apiClient } from './api'
import { Favorite } from '../types/favorite'

class FavoriteService {
  async getFavorites(): Promise<Favorite[]> {
    return apiClient.get<Favorite[]>('/favorites')
  }

  async addFavorite(activityId: string): Promise<Favorite> {
    return apiClient.post<Favorite>(`/favorites/${activityId}`)
  }

  async removeFavorite(activityId: string): Promise<void> {
    await apiClient.delete(`/favorites/${activityId}`)
  }
}

export const favoriteService = new FavoriteService()
