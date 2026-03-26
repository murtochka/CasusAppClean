import { apiClient } from './api'
import {
  Booking,
  BookingWithDetails,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  ActivityAvailability,
  CreateAvailabilityRequest,
} from '../types/booking'

// Mock availability data for mock activities
const generateMockAvailability = (activityId: string): ActivityAvailability[] => {
  const slots: ActivityAvailability[] = [];
  const today = new Date();
  
  // Generate availability for next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0]; // yyyy-MM-dd format
    
    // Morning slot
    slots.push({
      id: `mock-slot-${activityId}-${i}-morning`,
      activityId,
      date: dateStr,
      startTime: '09:00',
      endTime: '12:00',
      availableSpots: Math.floor(Math.random() * 5) + 5, // 5-10 spots
      createdAt: today.toISOString(),
    });
    
    // Afternoon slot
    slots.push({
      id: `mock-slot-${activityId}-${i}-afternoon`,
      activityId,
      date: dateStr,
      startTime: '14:00',
      endTime: '17:00',
      availableSpots: Math.floor(Math.random() * 5) + 3, // 3-8 spots
      createdAt: today.toISOString(),
    });
  }
  
  return slots;
};

class BookingService {
  async getBookings(): Promise<Booking[]> {
    const response = await apiClient.get<Booking[] | { bookings?: Booking[] }>('/bookings')

    if (Array.isArray(response)) {
      return response
    }

    if (response && Array.isArray(response.bookings)) {
      return response.bookings
    }

    return []
  }

  async getBookingById(id: string): Promise<BookingWithDetails> {
    return apiClient.get<BookingWithDetails>(`/bookings/${id}`)
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    // Handle mock bookings for mock activities
    if (data.activityId.startsWith('mock-')) {
      const mockBooking: Booking = {
        id: `mock-booking-${Date.now()}`,
        userId: 'mock-user',
        activityId: data.activityId,
        availabilityId: data.availabilityId,
        participants: data.participants,
        totalPrice: 0, // Would be calculated based on activity price
        status: 'confirmed',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockBooking;
    }
    
    return apiClient.post<Booking>('/bookings', data)
  }

  async updateBookingStatus(id: string, data: UpdateBookingStatusRequest): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data)
  }

  async cancelBooking(id: string): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, { status: 'cancelled' })
  }

  async getAvailability(activityId: string): Promise<ActivityAvailability[]> {
    // Return mock data for mock activities
    if (activityId.startsWith('mock-')) {
      return generateMockAvailability(activityId);
    }
    
    return apiClient.get<ActivityAvailability[]>(`/availability/${activityId}`)
  }

  async createAvailability(data: CreateAvailabilityRequest): Promise<ActivityAvailability> {
    return apiClient.post<ActivityAvailability>('/availability', data)
  }

  async deleteAvailability(id: string): Promise<void> {
    await apiClient.delete(`/availability/${id}`)
  }
}

export const bookingService = new BookingService()
