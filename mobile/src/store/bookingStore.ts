import { create } from 'zustand'
import { Booking } from '../types/booking'
import { Review } from '../types/review'
import { bookingService } from '../services/bookingService'
import { reviewService } from '../services/reviewService'
import { logger } from '../utils/logger'

export interface SelectedSlot {
  id: string
  startTime: string
  endTime: string
  availableSpots: number
}

export interface PendingBooking {
  activityId?: string
  selectedDate?: string
  selectedSlot?: SelectedSlot
  participants: number
  totalPrice?: number
  paymentStatus?: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface BookingState {
  bookings: Booking[]
  currentBooking: Booking | null
  pendingBooking: PendingBooking | null
  isLoading: boolean
  error: string | null
  paymentStatus: 'idle' | 'processing' | 'completed' | 'failed'
  userReviews: Map<string, Review> // Map bookingId -> Review

  // Actions
  loadBookings: () => Promise<void>
  loadUserReviews: () => Promise<void>
  setCurrentBooking: (booking: Booking | null) => void
  addBooking: (booking: Booking) => void
  updateBooking: (booking: Booking) => void
  cancelBooking: (id: string) => Promise<void>
  
  // Booking flow actions
  initializeBooking: (activityId: string) => void
  updateBookingData: (updates: Partial<PendingBooking>) => void
  completePayment: () => void
  failPayment: () => void
  resetBooking: () => void
  
  // Review actions
  setUserReview: (bookingId: string, review: Review) => void
  clearUserReview: (bookingId: string) => void
  getUserReview: (bookingId: string) => Review | undefined
  
  reset: () => void
  clearError: () => void
}

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  currentBooking: null,
  pendingBooking: null,
  isLoading: false,
  error: null,
  paymentStatus: 'idle',
  userReviews: new Map(),

  loadBookings: async () => {
    set({ isLoading: true, error: null })
    try {
      const bookings = await bookingService.getBookings()
      set({ bookings, isLoading: false })
      logger.info('Bookings loaded', { count: bookings.length })
      
      // Load user reviews for all bookings
      get().loadUserReviews()
    } catch (error: any) {
      const message = error.message || 'Failed to load bookings'
      set({ error: message, isLoading: false })
      logger.error('Failed to load bookings', error)
    }
  },

  loadUserReviews: async () => {
    try {
      const bookingsState = get().bookings
      const bookings = Array.isArray(bookingsState) ? bookingsState : []
      const reviewPromises = bookings
        .filter(b => b.status === 'confirmed')
        .map(async (booking) => {
          try {
            const review = await reviewService.getUserReviewForBooking(booking.id)
            return { bookingId: booking.id, review }
          } catch (error) {
            return null
          }
        })

      const results = await Promise.all(reviewPromises)
      const reviews = new Map<string, Review>()
      
      results.forEach(result => {
        if (result && result.review) {
          reviews.set(result.bookingId, result.review)
        }
      })

      set({ userReviews: reviews })
      logger.info('User reviews loaded', { count: reviews.size })
    } catch (error: any) {
      logger.error('Failed to load user reviews', error)
      // Don't fail the whole flow if reviews fail to load
    }
  },

  setCurrentBooking: (booking: Booking | null) => {
    set({ currentBooking: booking })
  },

  addBooking: (booking: Booking) => {
    set({ bookings: [booking, ...get().bookings] })
  },

  updateBooking: (booking: Booking) => {
    const bookings = get().bookings.map((b) => (b.id === booking.id ? booking : b))
    set({ bookings })
  },

  cancelBooking: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const booking = await bookingService.cancelBooking(id)
      get().updateBooking(booking)
      set({ isLoading: false })
      logger.info('Booking cancelled', { bookingId: id })
    } catch (error: any) {
      const message = error.message || 'Failed to cancel booking'
      set({ error: message, isLoading: false })
      logger.error('Failed to cancel booking', error)
    }
  },

  // Booking flow actions
  initializeBooking: (activityId: string) => {
    set({
      pendingBooking: {
        activityId,
        participants: 1,
        paymentStatus: 'pending',
      },
    })
  },

  updateBookingData: (updates: Partial<PendingBooking>) => {
    const currentPending = get().pendingBooking
    set({
      pendingBooking: {
        ...currentPending,
        ...updates,
      } as PendingBooking,
    })
  },

  completePayment: () => {
    const pending = get().pendingBooking
    if (pending) {
      set({
        pendingBooking: {
          ...pending,
          paymentStatus: 'completed',
        },
        paymentStatus: 'completed',
      })
    }
  },

  failPayment: () => {
    const pending = get().pendingBooking
    if (pending) {
      set({
        pendingBooking: {
          ...pending,
          paymentStatus: 'failed',
        },
        paymentStatus: 'failed',
      })
    }
  },

  resetBooking: () => {
    set({
      pendingBooking: null,
      paymentStatus: 'idle',
    })
  },

  // Review actions
  setUserReview: (bookingId: string, review: Review) => {
    const reviews = new Map(get().userReviews)
    reviews.set(bookingId, review)
    set({ userReviews: reviews })
  },

  clearUserReview: (bookingId: string) => {
    const reviews = new Map(get().userReviews)
    reviews.delete(bookingId)
    set({ userReviews: reviews })
  },

  getUserReview: (bookingId: string) => {
    return get().userReviews.get(bookingId)
  },

  reset: () => {
    set({ bookings: [], currentBooking: null, pendingBooking: null, error: null, userReviews: new Map() })
  },

  clearError: () => {
    set({ error: null })
  },
}))
