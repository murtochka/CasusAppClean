import { create } from 'zustand';
import { calendarService } from '@/services/calendarService';
import { Activity } from '@/types/search';
import { logger } from '@/utils/logger';
import { generateMockCalendarData } from '@/data/mockActivities';

export interface CalendarDayData {
  date: string; // YYYY-MM-DD
  activities: Activity[];
}

interface CalendarState {
  selectedDate: Date;
  currentMonth: Date;
  viewMode: 'month' | 'week' | 'day';
  calendarData: CalendarDayData[];
  loading: boolean;
  error: string | null;

  // Actions
  selectDate: (date: Date) => void;
  setMonth: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  loadCalendarData: (month: Date) => Promise<void>;
  setFilters: (city?: string, category?: string) => void;
  clearError: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  currentMonth: new Date(),
  viewMode: 'month',
  calendarData: [],
  loading: false,
  error: null,

  selectDate: (date: Date) => {
    try {
      set({ selectedDate: date });
    } catch (error) {
      logger.error('Error selecting date:', error);
    }
  },

  setMonth: (date: Date) => {
    try {
      set({ currentMonth: date });
    } catch (error) {
      logger.error('Error setting month:', error);
    }
  },

  setViewMode: (mode: 'month' | 'week' | 'day') => {
    try {
      set({ viewMode: mode });
    } catch (error) {
      logger.error('Error setting view mode:', error);
    }
  },

  loadCalendarData: async (month: Date) => {
    set({ loading: true, error: null });
    try {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const response = await calendarService.getActivitiesByDateRange({
        startDate,
        endDate,
      });

      if (response && response.length > 0) {
        set({
          calendarData: response,
          loading: false,
        });
      } else {
        // Use mock data when API returns no data
        logger.info('Using mock calendar data');
        const mockData = generateMockCalendarData(month);
        set({
          calendarData: mockData,
          loading: false,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error loading calendar data, using mock data:', errorMessage);
      // Use mock data on error
      const mockData = generateMockCalendarData(month);
      set({
        calendarData: mockData,
        loading: false,
      });
    }
  },

  setFilters: (city?: string, category?: string) => {
    // TODO: Implement filter application
    logger.info('Calendar filters:', { city, category });
  },

  clearError: () => {
    set({ error: null });
  },
}));
