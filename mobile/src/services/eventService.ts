import { apiClient } from './api'
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventListResponse,
  EventFilterOptions,
} from '../types/event'
import { logger } from '../utils/logger'

class EventService {
  /**
   * Get all public published events with optional filters
   */
  async getPublicEvents(filters?: EventFilterOptions): Promise<EventListResponse> {
    try {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.city) params.append('city', filters.city)
      if (filters?.categoryId) params.append('categoryId', filters.categoryId)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.search) params.append('search', filters.search)

      const queryString = params.toString()
      const url = queryString ? `/events?${queryString}` : '/events'

      const response = await apiClient.get<EventListResponse>(url)
      logger.info('Fetched public events', { count: response.events.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch public events', error)
      throw error
    }
  }

  /**
   * Get own events (all statuses: draft, published, cancelled, completed)
   * Requires authentication
   */
  async getMyEvents(filters?: EventFilterOptions): Promise<EventListResponse> {
    try {
      const params = new URLSearchParams()
      if (filters?.page) params.append('page', String(filters.page))
      if (filters?.limit) params.append('limit', String(filters.limit))
      if (filters?.status) params.append('status', filters.status)

      const queryString = params.toString()
      const url = queryString ? `/my-events?${queryString}` : '/my-events'

      const response = await apiClient.get<EventListResponse>(url)
      logger.info('Fetched own events', { count: response.events.length })
      return response
    } catch (error) {
      logger.error('Failed to fetch own events', error)
      throw error
    }
  }

  /**
   * Get event details by ID
   */
  async getEventById(id: string): Promise<Event> {
    try {
      const event = await apiClient.get<Event>(`/events/${id}`)
      logger.info('Fetched event details', { eventId: id })
      return event
    } catch (error) {
      logger.error('Failed to fetch event', { eventId: id, error })
      throw error
    }
  }

  /**
   * Create new event (defaults to DRAFT status)
   * Requires authentication as 'guide' role
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    try {
      // Validate dates
      const startDate = new Date(data.startDateTime)
      const endDate = new Date(data.endDateTime)
      if (endDate <= startDate) {
        throw new Error('End date/time must be after start date/time')
      }

      const payload = {
        title: data.title,
        description: data.description || '',
        categoryIds: data.categoryIds, // Multi-category array
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        locationName: data.locationName,
        address: data.address || '',
        city: data.city,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        maxAttendees: data.maxAttendees,
        price: data.price || 0,
        isRecurring: data.isRecurring || false,
        recurrencePattern: data.recurrencePattern,
        tags: data.tags || [],
        ...(data.coverImageUrl && { coverImageUrl: data.coverImageUrl }),
      }

      const event = await apiClient.post<Event>('/events', payload)
      logger.info('Created event', { eventId: event.id })
      return event
    } catch (error) {
      logger.error('Failed to create event', error)
      throw error
    }
  }

  /**
   * Update event
   * Requires authentication and ownership
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<Event> {
    try {
      const payload = {
        ...data,
        // Convert empty strings to undefined to allow partial updates
        ...(data.description !== undefined && !data.description && { description: null }),
      }

      const event = await apiClient.put<Event>(`/events/${id}`, payload)
      logger.info('Updated event', { eventId: id })
      return event
    } catch (error) {
      logger.error('Failed to update event', { eventId: id, error })
      throw error
    }
  }

  /**
   * Publish event (DRAFT -> PUBLISHED)
   * Requires authentication and ownership
   */
  async publishEvent(id: string): Promise<Event> {
    try {
      const event = await apiClient.patch<Event>(`/events/${id}/publish`, {})
      logger.info('Published event', { eventId: id })
      return event
    } catch (error) {
      logger.error('Failed to publish event', { eventId: id, error })
      throw error
    }
  }

  /**
   * Cancel event (status -> CANCELLED)
   * Requires authentication and ownership
   */
  async cancelEvent(id: string): Promise<Event> {
    try {
      const event = await apiClient.patch<Event>(`/events/${id}/cancel`, {})
      logger.info('Cancelled event', { eventId: id })
      return event
    } catch (error) {
      logger.error('Failed to cancel event', { eventId: id, error })
      throw error
    }
  }

  /**
   * Duplicate event (creates copy in DRAFT with "(Copy)" suffix)
   * Requires authentication and ownership
   */
  async duplicateEvent(id: string): Promise<Event> {
    try {
      const event = await apiClient.post<Event>(`/events/${id}/duplicate`, {})
      logger.info('Duplicated event', { originalId: id, newId: event.id })
      return event
    } catch (error) {
      logger.error('Failed to duplicate event', { eventId: id, error })
      throw error
    }
  }
}

export const eventService = new EventService()
