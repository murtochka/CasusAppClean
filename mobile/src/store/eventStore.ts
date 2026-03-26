import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Event, EventListResponse, CreateEventRequest, UpdateEventRequest, EventWizardState } from '../types/event'
import { eventService } from '../services/eventService'
import { logger } from '../utils/logger'

export interface EventState {
  // Public events
  publicEvents: Event[]
  publicEventsLoading: boolean
  publicEventsError: string | null
  publicEventsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // My events (business owner)
  myEvents: Event[]
  myEventsLoading: boolean
  myEventsError: string | null
  myEventsPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }

  // Selected event
  selectedEvent: Event | null
  selectedEventLoading: boolean
  selectedEventError: string | null

  // Wizard state for creating/editing events
  wizardState: EventWizardState

  // Actions
  // Public events
  fetchPublicEvents: (filters?: any) => Promise<void>
  fetchEventById: (id: string) => Promise<void>

  // My events
  fetchMyEvents: (filters?: any) => Promise<void>
  createEvent: (data: CreateEventRequest) => Promise<Event>
  updateEvent: (id: string, data: UpdateEventRequest) => Promise<Event>
  publishEvent: (id: string) => Promise<Event>
  cancelEvent: (id: string) => Promise<Event>
  duplicateEvent: (id: string) => Promise<Event>

  // Wizard
  resetWizard: () => void
  updateWizardStep: (step: number) => void
  updateWizardData: (data: Partial<EventWizardState>) => void
  setWizardError: (error: string | null) => void
  setWizardSaving: (isSaving: boolean) => void

  // Utilities
  clearPublicEventsError: () => void
  clearMyEventsError: () => void
  clearSelectedEventError: () => void
}

const DEFAULT_WIZARD_STATE: EventWizardState = {
  currentStep: 1,
  title: '',
  description: '',
  categoryIds: [], // Multi-category support
  startDateTime: null,
  endDateTime: null,
  isRecurring: false,
  recurrenceType: 'weekly',
  recurrenceInterval: 1,
  recurrenceEndDate: null,
  locationName: '',
  address: '',
  city: '',
  country: '',
  latitude: null,
  longitude: null,
  coverImageUrl: '',
  maxAttendees: null,
  price: 0,
  tags: [],
  isSaving: false,
  error: null,
}

export const useEventStore = create<EventState>()(
  persist(
    (set, get) => ({
      // Public events
      publicEvents: [],
      publicEventsLoading: false,
      publicEventsError: null,
      publicEventsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

      // My events
      myEvents: [],
      myEventsLoading: false,
      myEventsError: null,
      myEventsPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

      // Selected event
      selectedEvent: null,
      selectedEventLoading: false,
      selectedEventError: null,

      // Wizard
      wizardState: DEFAULT_WIZARD_STATE,

      /**
       * Fetch public published events
       */
      fetchPublicEvents: async (filters?: any) => {
        set({ publicEventsLoading: true, publicEventsError: null })
        try {
          const response = await eventService.getPublicEvents(filters)
          set({
            publicEvents: response.events,
            publicEventsPagination: response.pagination,
            publicEventsLoading: false,
          })
          logger.info('Fetched public events', { count: response.events.length })
        } catch (error: any) {
          const message = error.message || 'Failed to fetch public events'
          set({ publicEventsError: message, publicEventsLoading: false })
          logger.error('Failed to fetch public events', error)
        }
      },

      /**
       * Fetch single event by ID
       */
      fetchEventById: async (id: string) => {
        set({ selectedEventLoading: true, selectedEventError: null })
        try {
          const event = await eventService.getEventById(id)
          set({ selectedEvent: event, selectedEventLoading: false })
          logger.info('Fetched event', { eventId: id })
        } catch (error: any) {
          const message = error.message || 'Failed to fetch event'
          set({ selectedEventError: message, selectedEventLoading: false })
          logger.error('Failed to fetch event', error)
        }
      },

      /**
       * Fetch my events (business owner)
       */
      fetchMyEvents: async (filters?: any) => {
        set({ myEventsLoading: true, myEventsError: null })
        try {
          const response = await eventService.getMyEvents(filters)
          set({
            myEvents: response.events,
            myEventsPagination: response.pagination,
            myEventsLoading: false,
          })
          logger.info('Fetched my events', { count: response.events.length })
        } catch (error: any) {
          const message = error.message || 'Failed to fetch my events'
          set({ myEventsError: message, myEventsLoading: false })
          logger.error('Failed to fetch my events', error)
        }
      },

      /**
       * Create new event
       */
      createEvent: async (data: CreateEventRequest) => {
        set({ wizardState: { ...get().wizardState, isSaving: true, error: null } })
        try {
          const event = await eventService.createEvent(data)
          // Update myEvents list
          set({
            myEvents: [...get().myEvents, event],
            wizardState: DEFAULT_WIZARD_STATE,
          })
          logger.info('Created event', { eventId: event.id })
          return event
        } catch (error: any) {
          const message = error.message || 'Failed to create event'
          set({
            wizardState: { ...get().wizardState, isSaving: false, error: message },
          })
          logger.error('Failed to create event', error)
          throw error
        }
      },

      /**
       * Update event
       */
      updateEvent: async (id: string, data: UpdateEventRequest) => {
        set({ wizardState: { ...get().wizardState, isSaving: true, error: null } })
        try {
          const event = await eventService.updateEvent(id, data)
          // Update lists
          set({
            myEvents: get().myEvents.map((e) => (e.id === id ? event : e)),
            publicEvents: get().publicEvents.map((e) => (e.id === id ? event : e)),
            selectedEvent: get().selectedEvent?.id === id ? event : get().selectedEvent,
            wizardState: DEFAULT_WIZARD_STATE,
          })
          logger.info('Updated event', { eventId: id })
          return event
        } catch (error: any) {
          const message = error.message || 'Failed to update event'
          set({
            wizardState: { ...get().wizardState, isSaving: false, error: message },
          })
          logger.error('Failed to update event', error)
          throw error
        }
      },

      /**
       * Publish event
       */
      publishEvent: async (id: string) => {
        set({ myEventsLoading: true, myEventsError: null })
        try {
          const event = await eventService.publishEvent(id)
          set({
            myEvents: get().myEvents.map((e) => (e.id === id ? event : e)),
            publicEvents: [...get().publicEvents, event],
            selectedEvent: get().selectedEvent?.id === id ? event : get().selectedEvent,
            myEventsLoading: false,
          })
          logger.info('Published event', { eventId: id })
          return event
        } catch (error: any) {
          const message = error.message || 'Failed to publish event'
          set({ myEventsError: message, myEventsLoading: false })
          logger.error('Failed to publish event', error)
          throw error
        }
      },

      /**
       * Cancel event
       */
      cancelEvent: async (id: string) => {
        set({ myEventsLoading: true, myEventsError: null })
        try {
          const event = await eventService.cancelEvent(id)
          set({
            myEvents: get().myEvents.map((e) => (e.id === id ? event : e)),
            publicEvents: get().publicEvents.filter((e) => e.id !== id),
            selectedEvent: get().selectedEvent?.id === id ? event : get().selectedEvent,
            myEventsLoading: false,
          })
          logger.info('Cancelled event', { eventId: id })
          return event
        } catch (error: any) {
          const message = error.message || 'Failed to cancel event'
          set({ myEventsError: message, myEventsLoading: false })
          logger.error('Failed to cancel event', error)
          throw error
        }
      },

      /**
       * Duplicate event
       */
      duplicateEvent: async (id: string) => {
        set({ myEventsLoading: true, myEventsError: null })
        try {
          const event = await eventService.duplicateEvent(id)
          set({
            myEvents: [...get().myEvents, event],
            myEventsLoading: false,
          })
          logger.info('Duplicated event', { originalId: id, newId: event.id })
          return event
        } catch (error: any) {
          const message = error.message || 'Failed to duplicate event'
          set({ myEventsError: message, myEventsLoading: false })
          logger.error('Failed to duplicate event', error)
          throw error
        }
      },

      /**
       * Wizard actions
       */
      resetWizard: () => {
        set({ wizardState: DEFAULT_WIZARD_STATE })
      },

      updateWizardStep: (step: number) => {
        set({
          wizardState: { ...get().wizardState, currentStep: step },
        })
      },

      updateWizardData: (data: Partial<EventWizardState>) => {
        set({
          wizardState: { ...get().wizardState, ...data },
        })
      },

      setWizardError: (error: string | null) => {
        set({
          wizardState: { ...get().wizardState, error },
        })
      },

      setWizardSaving: (isSaving: boolean) => {
        set({
          wizardState: { ...get().wizardState, isSaving },
        })
      },

      /**
       * Utilities
       */
      clearPublicEventsError: () => {
        set({ publicEventsError: null })
      },

      clearMyEventsError: () => {
        set({ myEventsError: null })
      },

      clearSelectedEventError: () => {
        set({ selectedEventError: null })
      },
    }),
    {
      name: 'event-store',
      // Don't persist wizard state or loading states
      partialize: (state) => ({
        publicEvents: state.publicEvents,
        myEvents: state.myEvents,
        selectedEvent: state.selectedEvent,
      }),
    }
  )
)
