import { Activity } from './search'
import { User } from './auth'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: string
  userId: string
  activityId: string
  availabilityId: string
  participants: number
  totalPrice: number
  status: BookingStatus
  createdAt: string
  updatedAt?: string
}

export interface BookingWithDetails extends Booking {
  activity: Activity
  user: User
  availability: ActivityAvailability
}

export interface CreateBookingRequest {
  activityId: string
  availabilityId: string
  participants: number
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus
}

export interface ActivityAvailability {
  id: string
  activityId: string
  date: string
  startTime: string
  endTime: string
  availableSpots: number
  createdAt: string
}

export interface CreateAvailabilityRequest {
  activityId: string
  date: string
  startTime: string
  endTime: string
  availableSpots: number
}
