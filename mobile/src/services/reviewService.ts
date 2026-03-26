import { apiClient } from './api'
import { Review, CreateReviewRequest, UpdateReviewRequest, GetReviewsResponse } from '../types/review'

class ReviewService {
  async getReviews(activityId: string, limit: number = 10, offset: number = 0): Promise<GetReviewsResponse> {
    return apiClient.get<GetReviewsResponse>(`/reviews/activity/${activityId}?limit=${limit}&offset=${offset}`)
  }

  async createReview(data: CreateReviewRequest): Promise<Review> {
    return apiClient.post<Review>('/reviews', data)
  }

  async updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
    return apiClient.put<Review>(`/reviews/${id}`, data)
  }

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`)
  }

  async getUserReviewForBooking(bookingId: string): Promise<Review | null> {
    try {
      // Note: This assumes backend returns user's review if it exists
      // If no endpoint exists, this will need backend support
      return await apiClient.get<Review>(`/reviews/booking/${bookingId}`)
    } catch (error: any) {
      // If 404, no review exists
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  }
}

export const reviewService = new ReviewService()
