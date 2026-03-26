import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuideProfile } from '../types/search';
import { GuideStats } from '../types/guide';
import { Activity } from '../types/search';
import { BookingWithDetails } from '../types/booking';
import { guideService } from '../services/guideService';
import { logger } from '../utils/logger';

interface GuideState {
  // State
  profile: GuideProfile | null;
  stats: GuideStats | null;
  activities: Activity[];
  bookings: BookingWithDetails[];
  loading: {
    profile: boolean;
    stats: boolean;
    activities: boolean;
    bookings: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadActivities: (filters?: { isActive?: boolean; page?: number; limit?: number }) => Promise<void>;
  loadBookings: (filters?: { upcoming?: boolean; status?: string; activityId?: string; page?: number; limit?: number }) => Promise<void>;
  createActivity: (data: any) => Promise<Activity>;
  updateActivity: (id: string, data: any) => Promise<Activity>;
  deleteActivity: (id: string) => Promise<void>;
  addAvailability: (activityId: string, slots: any[]) => Promise<void>;
  bulkAddAvailability: (data: any) => Promise<void>;
  updateAvailabilitySlot: (id: string, data: any) => Promise<void>;
  deleteAvailabilitySlot: (id: string) => Promise<void>;
  refreshDashboard: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  profile: null,
  stats: null,
  activities: [],
  bookings: [],
  loading: {
    profile: false,
    stats: false,
    activities: false,
    bookings: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
};

export const useGuideStore = create<GuideState>()(
  persist(
    (set, get) => ({
      ...initialState,

      loadProfile: async () => {
        try {
          set({ loading: { ...get().loading, profile: true }, error: null });
          const profile = await guideService.getOwnProfile();
          set({ profile, loading: { ...get().loading, profile: false } });
        } catch (error: any) {
          logger.error('Failed to load guide profile:', error);
          set({
            error: error.message || 'Failed to load profile',
            loading: { ...get().loading, profile: false },
          });
        }
      },

      loadStats: async () => {
        try {
          set({ loading: { ...get().loading, stats: true }, error: null });
          const stats = await guideService.getGuideStats();
          set({ stats, loading: { ...get().loading, stats: false } });
        } catch (error: any) {
          logger.error('Failed to load guide stats:', error);
          set({
            error: error.message || 'Failed to load statistics',
            loading: { ...get().loading, stats: false },
          });
        }
      },

      loadActivities: async (filters = {}) => {
        try {
          set({ loading: { ...get().loading, activities: true }, error: null });
          const result = await guideService.getMyActivities(filters);
          set({
            activities: result.activities,
            loading: { ...get().loading, activities: false },
          });
        } catch (error: any) {
          logger.error('Failed to load activities:', error);
          set({
            error: error.message || 'Failed to load activities',
            loading: { ...get().loading, activities: false },
          });
        }
      },

      loadBookings: async (filters = {}) => {
        try {
          set({ loading: { ...get().loading, bookings: true }, error: null });
          const result = await guideService.getMyBookings(filters);
          set({
            bookings: result.bookings,
            loading: { ...get().loading, bookings: false },
          });
        } catch (error: any) {
          logger.error('Failed to load bookings:', error);
          set({
            error: error.message || 'Failed to load bookings',
            loading: { ...get().loading, bookings: false },
          });
        }
      },

      createActivity: async (data: any) => {
        try {
          set({ loading: { ...get().loading, creating: true }, error: null });
          const activity = await guideService.createActivity(data);
          
          // Add to activities list
          set({
            activities: [activity, ...get().activities],
            loading: { ...get().loading, creating: false },
          });
          
          // Refresh stats
          get().loadStats();
          
          return activity;
        } catch (error: any) {
          logger.error('Failed to create activity:', error);
          set({
            error: error.message || 'Failed to create activity',
            loading: { ...get().loading, creating: false },
          });
          throw error;
        }
      },

      updateActivity: async (id: string, data: any) => {
        try {
          set({ loading: { ...get().loading, updating: true }, error: null });
          const updated = await guideService.updateActivity(id, data);
          
          // Update in activities list
          set({
            activities: get().activities.map(a => a.id === id ? updated : a),
            loading: { ...get().loading, updating: false },
          });
          
          return updated;
        } catch (error: any) {
          logger.error('Failed to update activity:', error);
          set({
            error: error.message || 'Failed to update activity',
            loading: { ...get().loading, updating: false },
          });
          throw error;
        }
      },

      deleteActivity: async (id: string) => {
        try {
          set({ loading: { ...get().loading, deleting: true }, error: null });
          await guideService.deleteActivity(id);
          
          // Remove from activities list (or mark as inactive)
          set({
            activities: get().activities.filter(a => a.id !== id),
            loading: { ...get().loading, deleting: false },
          });
          
          // Refresh stats
          get().loadStats();
        } catch (error: any) {
          logger.error('Failed to delete activity:', error);
          set({
            error: error.message || 'Failed to delete activity',
            loading: { ...get().loading, deleting: false },
          });
          throw error;
        }
      },

      addAvailability: async (activityId: string, slots: any[]) => {
        try {
          set({ error: null });
          // Add multiple simple slots
          for (const slot of slots) {
            await guideService.addAvailability(activityId, slot);
          }
        } catch (error: any) {
          logger.error('Failed to add availability:', error);
          set({ error: error.message || 'Failed to add availability' });
          throw error;
        }
      },

      bulkAddAvailability: async (data: any) => {
        try {
          set({ error: null });
          await guideService.bulkAddAvailability(data);
        } catch (error: any) {
          logger.error('Failed to bulk add availability:', error);
          set({ error: error.message || 'Failed to add availability slots' });
          throw error;
        }
      },

      updateAvailabilitySlot: async (id: string, data: any) => {
        try {
          set({ error: null });
          await guideService.updateAvailability(id, data);
        } catch (error: any) {
          logger.error('Failed to update availability slot:', error);
          set({ error: error.message || 'Failed to update slot' });
          throw error;
        }
      },

      deleteAvailabilitySlot: async (id: string) => {
        try {
          set({ error: null });
          await guideService.deleteAvailability(id);
        } catch (error: any) {
          logger.error('Failed to delete availability slot:', error);
          set({ error: error.message || 'Failed to delete slot' });
          throw error;
        }
      },

      refreshDashboard: async () => {
        // Reload all dashboard data
        await Promise.all([
          get().loadProfile(),
          get().loadStats(),
          get().loadActivities({ isActive: true }),
        ]);
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'guide-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        // Don't persist stats and activities (they should be fresh on each session)
      }),
    }
  )
);
