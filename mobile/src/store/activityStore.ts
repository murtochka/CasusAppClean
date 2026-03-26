import { create } from 'zustand';
import { searchService } from '../services/searchService';
import { Activity } from '../types/search';
import { logger } from '../utils/logger';
import { mockActivities } from '@/data/mockActivities';

interface ActivityState {
  currentActivity: Activity | null;
  isLoading: boolean;
  error: string | null;
  fetchActivity: (id: string) => Promise<void>;
  clearActivity: () => void;
  clearError: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  currentActivity: null,
  isLoading: false,
  error: null,

  fetchActivity: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      // Check if this is a mock activity (ID starts with 'mock-')
      if (id.startsWith('mock-')) {
        const mockActivity = mockActivities.find(a => a.id === id);
        if (mockActivity) {
          set({ currentActivity: mockActivity, isLoading: false });
          logger.info('Mock activity loaded', { id });
          return;
        }
      }
      
      // Fetch from API for real activities
      const activity = await searchService.getActivityById(id);
      set({ currentActivity: activity, isLoading: false });
      logger.info('Activity fetched successfully', { id });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load activity';
      set({ error: errorMessage, isLoading: false });
      logger.error('Failed to fetch activity', error);
      throw error;
    }
  },

  clearActivity: () => {
    set({ currentActivity: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
