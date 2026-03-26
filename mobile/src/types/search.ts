export type Difficulty = 'easy' | 'medium' | 'hard'
export type SortBy = 'price' | 'rating' | 'newest'

export interface Activity {
  id: string
  guideId: string
  categoryId: string
  title: string
  description: string
  price: number
  maxParticipants: number
  durationMinutes: number
  difficulty: Difficulty
  meetingPoint: string
  city: string
  country: string
  isActive: boolean
  createdAt: string
}

export interface GuideProfile {
  id: string
  userId: string
  businessName: string
  description: string
  licenseNumber: string
  sustainabilityCertified: boolean
  baseLocation: string
  rating: number
  createdAt: string
  updatedAt: string
}

export interface ActivityWithGuide extends Activity {
  guide: GuideProfile & { user: { fullName: string; avatarUrl?: string } }
  rating?: number
  reviewCount?: number
}

export interface ActivityCategory {
  id: string
  name: string
  icon?: string
}

export interface SearchFiltersRequest {
  city?: string
  categoryId?: string
  difficulty?: Difficulty
  priceMin?: number
  priceMax?: number
  minRating?: number
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
  sortBy?: SortBy
}

export interface SearchSuggestionsResponse {
  cities?: string[]
  categories?: ActivityCategory[]
}

export interface SearchResultsResponse {
  activities: ActivityWithGuide[]
  total: number
  limit: number
  offset: number
}

export interface SearchMetadata {
  cities: string[]
  categories: ActivityCategory[]
  priceMin: number
  priceMax: number
  difficulties: Difficulty[]
}
