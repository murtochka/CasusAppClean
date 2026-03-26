import { User } from './auth'

export interface Review {
  id: string
  bookingId: string
  userId: string
  rating: number
  comment?: string
  photoUrls?: string[] // Array of up to 3 photo URLs
  createdAt: string
  updatedAt?: string
}

export interface ReviewWithUser extends Review {
  user: Pick<User, 'id' | 'fullName' | 'avatarUrl'>
}

export interface CreateReviewRequest {
  bookingId: string
  rating: number
  comment?: string
  photos?: string[] // Array of up to 3 photo URLs
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
  photos?: string[] // Array of up to 3 photo URLs
}

export interface GetReviewsResponse {
  reviews: ReviewWithUser[]
  total: number
  limit: number
  offset: number
  averageRating: number
}
