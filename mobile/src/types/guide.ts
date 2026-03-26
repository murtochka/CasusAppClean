export interface CreateGuideProfileRequest {
  businessName: string
  description: string
  licenseNumber: string
  baseLocation: string
  sustainabilityCertified?: boolean
}

export interface UpdateGuideProfileRequest {
  businessName?: string
  description?: string
  licenseNumber?: string
  baseLocation?: string
  sustainabilityCertified?: boolean
}

export interface GuideStats {
  totalActivities: number
  totalBookings: number
  bookingsThisMonth: number
  bookingsLastMonth: number
  averageRating: number
  totalRevenue: number
  revenueThisMonth: number
  recentBookings: Array<{
    id: string
    activityId: string
    activityTitle: string
    userId: string
    userName: string
    userAvatar: string | null
    participants: number
    totalPrice: string
    status: string
    createdAt: string
    date: string
    startTime: string
  }>
  recentReviews: Array<{
    id: string
    activityId: string
    activityTitle: string
    userId: string
    userName: string
    userAvatar: string | null
    rating: number
    comment: string | null
    createdAt: string
  }>
}

// Activity Creation Form Types
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ActivityCategory {
  id: string
  name: string
  icon?: string
}

export interface CreateActivityFormData {
  // Step 1: Basic Info
  title: string
  description: string
  categoryId: string
  difficulty: Difficulty

  // Step 2: Details
  price: number
  maxParticipants: number
  durationMinutes: number
  meetingPoint: string
  city: string
  country: string

  // Step 3: Photos
  photos?: string[] // URLs or base64 data

  // Step 4: Availability
  availabilityDate?: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  availableSpots?: number
}

export interface ActivityFormStep {
  step: 1 | 2 | 3 | 4
  isValid: boolean
  data: Partial<CreateActivityFormData>
}

