import { apiClient } from '@/services/api';
import { Activity } from '@/types/search';
import { logger } from '@/utils/logger';

export interface CalendarDayData {
  date: string;
  activities: Activity[];
}

export interface CalendarRequest {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  city?: string;
  category?: string;
}

class CalendarService {
  async getActivitiesByDateRange(
    params: CalendarRequest
  ): Promise<CalendarDayData[] | null> {
    try {
      const queryParams = new URLSearchParams({
        startDate: params.startDate,
        endDate: params.endDate,
        ...(params.city && { city: params.city }),
        ...(params.category && { category: params.category }),
      });

      const response = await apiClient.get(`/calendar/activities?${queryParams}`);

      if (!response.data) {
        logger.warn('No calendar data returned');
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error('Calendar service error:', error);
      throw error;
    }
  }

  async getActivitySlots(
    activityId: string,
    startDate: string,
    endDate: string
  ): Promise<any[] | null> {
    try {
      const response = await apiClient.get(
        `/calendar/${activityId}/slots?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data || null;
    } catch (error) {
      logger.error('Error fetching activity slots:', error);
      throw error;
    }
  }

  async bulkAddAvailability(data: any): Promise<boolean> {
    try {
      await apiClient.post('/guide/availability/bulk', data);
      return true;
    } catch (error) {
      logger.error('Error adding availability:', error);
      throw error;
    }
  }

  async deleteAvailabilityRange(
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    try {
      await apiClient.delete('/guide/availability/range', {
        data: { startDate, endDate },
      });
      return true;
    } catch (error) {
      logger.error('Error deleting availability:', error);
      throw error;
    }
  }

  async getICalUrl(bookingId: string): Promise<string | null> {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/ical`);
      return response.data?.url || null;
    } catch (error) {
      logger.error('Error getting iCal URL:', error);
      throw error;
    }
  }
}

export const calendarService = new CalendarService();
