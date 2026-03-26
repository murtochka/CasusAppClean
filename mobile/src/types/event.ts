/**
 * Event Management Types for Mobile
 */

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'
export type RecurrenceType = 'daily' | 'weekly' | 'monthly'

export interface RecurrencePattern {
  type: RecurrenceType
  interval: number // e.g., every 2 weeks
  endDate?: string // ISO 8601 datetime
}

export interface Event {
  id: string
  businessId: string
  businessName?: string
  // Legacy fields (backward compatibility)
  categoryId: string
  categoryName?: string
  // New fields (multi-category support)
  categoryIds: string[]
  categories: Array<{ id: string; name: string; icon?: string }>
  title: string
  description?: string
  coverImageUrl?: string
  startDateTime: string // ISO 8601
  endDateTime: string // ISO 8601
  locationName: string
  address?: string
  city: string
  country: string
  latitude?: number
  longitude?: number
  maxAttendees?: number | null
  currentAttendees: number
  price: number | string
  status: EventStatus
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern | null
  tags?: string[]
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

/**
 * Request: Create Event (Step 1-4 Wizard)
 */
export interface CreateEventRequest {
  // Step 1: Details
  title: string
  description?: string
  // Multi-category support
  categoryIds: string[]

  // Step 2: Date & Time
  startDateTime: string // ISO 8601
  endDateTime: string // ISO 8601
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern

  // Step 3: Location
  locationName: string
  address?: string
  city: string
  country: string
  latitude?: number
  longitude?: number

  // Step 4: Media (optional, added separately via file upload)
  coverImageUrl?: string

  // Additional
  maxAttendees?: number | null
  price?: number | string
  tags?: string[]
}

/**
 * Request: Update Event
 */
export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  status?: EventStatus
}

/**
 * API Response: Event List
 */
export interface EventListResponse {
  events: Event[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Step-by-step wizard state
 */
export interface EventWizardState {
  currentStep: number // 1-4
  // Step 1: Details
  title: string
  description: string
  categoryIds: string[] // Multi-category support
  // Step 2: Date & Time
  startDateTime: Date | null
  endDateTime: Date | null
  isRecurring: boolean
  recurrenceType: RecurrenceType
  recurrenceInterval: number
  recurrenceEndDate: Date | null
  // Step 3: Location
  locationName: string
  address: string
  city: string
  country: string
  latitude: number | null
  longitude: number | null
  // Step 4: Media
  coverImageUrl: string
  coverImageFile?: any // Upload file object
  // Metadata
  maxAttendees: number | null
  price: number | string
  tags: string[]
  isSaving: boolean
  error: string | null
}

/**
 * Event analytics for business owner
 */
export interface EventAnalytics {
  eventId: string
  viewCount: number
  bookingCount: number
  totalRevenue: number
  averageRating?: number
  interestedCount?: number
}

/**
 * Filter options for event list
 */
export interface EventFilterOptions {
  city?: string
  categoryId?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}
