import { apiClient } from './api'
import { CreateGuideProfileRequest, UpdateGuideProfileRequest, GuideStats } from '../types/guide'
import { GuideProfile } from '../types/search'
import { Activity } from '../types/search'
import { BookingWithDetails } from '../types/booking'

class GuideService {
  async getGuideProfile(guideId: string): Promise<GuideProfile> {
    return apiClient.get<GuideProfile>(`/guides/${guideId}`)
  }

  async createGuideProfile(data: CreateGuideProfileRequest): Promise<GuideProfile> {
    return apiClient.post<GuideProfile>('/guides/profile', data)
  }

  async updateGuideProfile(data: UpdateGuideProfileRequest): Promise<GuideProfile> {
    return apiClient.put<GuideProfile>('/guides/profile', data)
  }

  async getOwnProfile(): Promise<GuideProfile> {
    return apiClient.get<GuideProfile>('/guides/profile/me')
  }

  async getGuideStats(): Promise<GuideStats> {
    return apiClient.get<GuideStats>('/guides/stats')
  }

  async getMyActivities(params?: {
    isActive?: boolean
    page?: number
    limit?: number
  }): Promise<{ activities: Activity[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString();
    return apiClient.get(queryString ? `/guides/activities?${queryString}` : '/guides/activities');
  }

  async getMyBookings(params?: {
    upcoming?: boolean
    status?: string
    activityId?: string
    page?: number
    limit?: number
  }): Promise<{ bookings: BookingWithDetails[]; pagination: any }> {
    const queryParams = new URLSearchParams();
    if (params?.upcoming !== undefined) queryParams.append('upcoming', String(params.upcoming));
    if (params?.status) queryParams.append('status', params.status);
    if (params?.activityId) queryParams.append('activityId', params.activityId);
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    const queryString = queryParams.toString();
    return apiClient.get(queryString ? `/guides/bookings?${queryString}` : '/guides/bookings');
  }

  async getRevenue(params?: {
    startDate?: string
    endDate?: string
  }): Promise<{
    totalRevenue: number
    paidBookings: number
    pendingRevenue: number
    refundedAmount: number
    breakdown: Array<{ month: string; revenue: number; bookings: number }>
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    const queryString = queryParams.toString();
    return apiClient.get(queryString ? `/guides/revenue?${queryString}` : '/guides/revenue');
  }

  async createActivity(data: any): Promise<Activity> {
    return apiClient.post<Activity>('/activities', data)
  }

  async updateActivity(id: string, data: any): Promise<Activity> {
    return apiClient.put<Activity>(`/activities/${id}`, data)
  }

  async deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`/activities/${id}`)
  }

  async addAvailability(activityId: string, data: any): Promise<any> {
    return apiClient.post(`/${activityId}/availability`, data)
  }

  async bulkAddAvailability(data: any): Promise<void> {
    return apiClient.post('/calendar/guide/availability/bulk', data)
  }

  async updateAvailability(id: string, data: any): Promise<any> {
    return apiClient.put(`/availability/${id}`, data)
  }

  async deleteAvailability(id: string): Promise<void> {
    return apiClient.delete(`/availability/${id}`)
  }

  async deleteAvailabilityRange(params: {
    activityId: string
    startDate: string
    endDate: string
  }): Promise<void> {
    const queryParams = new URLSearchParams({
      activityId: params.activityId,
      startDate: params.startDate,
      endDate: params.endDate
    });
    return apiClient.delete(`/calendar/guide/availability/range?${queryParams.toString()}`);
  }
}

export const guideService = new GuideService()
