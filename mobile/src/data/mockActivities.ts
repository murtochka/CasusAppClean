import { Activity, ActivityWithGuide } from '@/types/search';

export const mockActivities: Activity[] = [
  {
    id: 'mock-activity-1',
    guideId: 'guide-1',
    categoryId: 'hiking',
    title: 'Sunset Mountain Hiking Adventure',
    description: 'Experience breathtaking views on this guided mountain hike during golden hour. Perfect for all skill levels.',
    price: 45,
    maxParticipants: 12,
    durationMinutes: 180,
    difficulty: 'easy',
    meetingPoint: 'Mountain Trail Parking Lot',
    city: 'Boulder',
    country: 'USA',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z',
  },
  {
    id: 'mock-activity-2',
    guideId: 'guide-2',
    categoryId: 'kayaking',
    title: 'Coastal Kayaking Experience',
    description: 'Paddle through crystal clear waters and explore hidden coves along the stunning coastline.',
    price: 65,
    maxParticipants: 8,
    durationMinutes: 240,
    difficulty: 'medium',
    meetingPoint: 'Marina Bay Dock 3',
    city: 'San Diego',
    country: 'USA',
    isActive: true,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'mock-activity-3',
    guideId: 'guide-3',
    categoryId: 'climbing',
    title: 'Rock Climbing Masterclass',
    description: 'Advanced rock climbing techniques for experienced climbers. Challenge yourself on expert-level routes.',
    price: 95,
    maxParticipants: 6,
    durationMinutes: 300,
    difficulty: 'hard',
    meetingPoint: 'Red Rock Climbing Center',
    city: 'Denver',
    country: 'USA',
    isActive: true,
    createdAt: '2026-02-10T09:00:00Z',
  },
  {
    id: 'mock-activity-4',
    guideId: 'guide-4',
    categoryId: 'wildlife',
    title: 'Wildlife Safari Photography Tour',
    description: 'Capture amazing wildlife moments with professional photography guidance in their natural habitat.',
    price: 120,
    maxParticipants: 10,
    durationMinutes: 360,
    difficulty: 'easy',
    meetingPoint: 'Nature Reserve Main Entrance',
    city: 'Portland',
    country: 'USA',
    isActive: true,
    createdAt: '2026-02-15T07:00:00Z',
  },
  {
    id: 'mock-activity-5',
    guideId: 'guide-5',
    categoryId: 'cycling',
    title: 'Scenic Coastal Bike Tour',
    description: 'Ride along the beautiful coastline with stops at local attractions and scenic viewpoints.',
    price: 55,
    maxParticipants: 15,
    durationMinutes: 240,
    difficulty: 'medium',
    meetingPoint: 'Beach Boardwalk Bike Rental',
    city: 'Santa Monica',
    country: 'USA',
    isActive: true,
    createdAt: '2026-02-20T08:30:00Z',
  },
  {
    id: 'mock-activity-6',
    guideId: 'guide-6',
    categoryId: 'snorkeling',
    title: 'Tropical Reef Snorkeling',
    description: 'Discover colorful marine life and coral reefs in crystal-clear tropical waters.',
    price: 75,
    maxParticipants: 12,
    durationMinutes: 180,
    difficulty: 'easy',
    meetingPoint: 'Beachside Resort Dock',
    city: 'Key West',
    country: 'USA',
    isActive: true,
    createdAt: '2026-02-25T11:00:00Z',
  },
];

export const mockActivitiesWithGuide: ActivityWithGuide[] = mockActivities.map((activity, index) => ({
  ...activity,
  imageUrl: `https://picsum.photos/seed/${activity.id}/400/250`,
  guide: {
    id: activity.guideId,
    userId: activity.guideId,
    businessName: `Adventure Tours ${index + 1}`,
    description: 'Professional outdoor guide with years of experience',
    licenseNumber: `LIC-${1000 + index}`,
    sustainabilityCertified: index % 2 === 0,
    baseLocation: activity.city,
    rating: 4.0 + (index % 5) * 0.2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    user: {
      fullName: ['Alex Rivera', 'Jordan Smith', 'Taylor Chen', 'Morgan Blake', 'Casey Williams', 'Sam Johnson'][index],
      avatarUrl: `https://i.pravatar.cc/150?img=${index + 10}`,
    },
  },
  rating: 4.0 + (index % 5) * 0.2,
  reviewCount: 20 + index * 10,
}));

// Helper to generate calendar data with mock activities
export const generateMockCalendarData = (month: Date): Array<{ date: string; activities: Activity[] }> => {
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const calendarData: Array<{ date: string; activities: Activity[] }> = [];

  // Generate data for each day
  for (let day = 1; day <= endDate.getDate(); day++) {
    const currentDate = new Date(month.getFullYear(), month.getMonth(), day);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Add activities based on day pattern (consistent, not random)
    let activities: Activity[] = [];
    
    if (day % 15 === 0) {
      // Days divisible by 15 get all activities
      activities = mockActivities;
    } else if (day % 6 === 0) {
      // Days divisible by 6 get 3 activities
      activities = mockActivities.slice(0, 3);
    } else if (day % 4 === 0) {
      // Days divisible by 4 get 2 activities
      activities = mockActivities.slice(3, 5);
    } else if (day % 3 === 0) {
      // Days divisible by 3 get 1 activity
      activities = [mockActivities[Math.floor((day / 3) % mockActivities.length)]];
    }
    
    calendarData.push({
      date: dateStr,
      activities,
    });
  }

  return calendarData;
};
