import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalendarStore } from '@/store/calendarStore';
import { EventCard } from '@/components/home';
import { MonthCalendar } from '@/components/calendar/MonthCalendar';
import { Colors, Spacing, BorderRadius } from '@/constants';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import type { ActivityWithGuide } from '@/types/search';
import { isSameMonth } from 'date-fns';
import { mockActivitiesWithGuide } from '@/data/mockActivities';

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  const {
    selectedDate,
    currentMonth,
    calendarData,
    selectDate,
    setMonth,
    loadCalendarData,
  } = useCalendarStore();

  const [refreshing, setRefreshing] = useState(false);

  // Load calendar data for current month and when selected date is in another month
  useEffect(() => {
    loadCalendarData(currentMonth);
  }, [currentMonth, loadCalendarData]);

  useEffect(() => {
    if (!isSameMonth(selectedDate, currentMonth)) {
      setMonth(selectedDate);
    }
  }, [selectedDate, currentMonth, setMonth]);

  // Handle pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData(currentMonth);
    setRefreshing(false);
  };

  const handleDateSelect = (date: Date) => {
    selectDate(date);
  };

  const handleSearchPress = () => {
    router.push('/(tabs)/search');
  };

  // Handle activity card press
  const handleActivityPress = (activityId: string) => {
    router.push(`/activity/${activityId}`);
  };

  // Get activities for selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const activitiesForSelectedDate =
    calendarData.find(
      (day) => day.date === selectedDateStr
    )?.activities ?? [];

  // Debug logging
  if (__DEV__) {
    console.log('Selected date:', selectedDateStr);
    console.log('Activities found:', activitiesForSelectedDate.length);
    console.log('Calendar data entries:', calendarData.length);
  }

  // Convert Activity to ActivityWithGuide - use mock data for guide info and images
  const activitiesWithGuide: ActivityWithGuide[] = activitiesForSelectedDate.map((activity) => {
    // Find matching mock activity with guide data
    const mockActivity = mockActivitiesWithGuide.find(m => m.id === activity.id);
    
    if (mockActivity) {
      return mockActivity;
    }
    
    // Fallback to basic guide data if not in mock data
    return {
      ...activity,
      imageUrl: `https://picsum.photos/seed/${activity.id}/400/250`,
      guide: {
        id: activity.guideId,
        userId: activity.guideId,
        businessName: 'Adventure Tours',
        description: '',
        licenseNumber: '',
        sustainabilityCertified: false,
        baseLocation: activity.city,
        rating: 4.5,
        createdAt: '',
        updatedAt: '',
        user: {
          fullName: 'Guide Name',
          avatarUrl: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
        },
      },
      rating: 4.5,
      reviewCount: 0,
    };
  });

  const renderHeader = () => (
    <>
      {/* Search bar */}
      <TouchableOpacity
        style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={handleSearchPress}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
        <Text style={[styles.searchPlaceholder, { color: theme.textTertiary }]}>
          Search by place, company, guide...
        </Text>
      </TouchableOpacity>

      {/* Month Calendar */}
      <View style={styles.calendarContainer}>
        <MonthCalendar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onMonthChange={setMonth}
          currentMonth={currentMonth}
          activitiesByDate={calendarData.reduce((acc, day) => {
            acc[day.date] = day.activities.length;
            return acc;
          }, {} as Record<string, number>)}
        />
      </View>

      {/* Section header */}
      <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Events on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <Text style={[styles.eventCount, { color: theme.textSecondary }]}>
          {activitiesForSelectedDate.length} {activitiesForSelectedDate.length === 1 ? 'event' : 'events'}
        </Text>
      </View>
    </>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>No events for this date</Text>
      <Text style={[styles.emptyStateSubtext, { color: theme.textTertiary }]}>
        Try selecting a different date
      </Text>
    </View>
  );

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}
          
          {/* Horizontal scrolling events */}
          {activitiesWithGuide.length > 0 ? (
            <View style={styles.horizontalScrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={Dimensions.get('window').width * 0.85 + Spacing.lg}
                contentContainerStyle={styles.horizontalScroll}
                nestedScrollEnabled
              >
                {activitiesWithGuide.map((item) => (
                  <EventCard
                    key={item.id}
                    activity={item}
                    onPress={() => handleActivityPress(item.id)}
                    horizontal
                  />
                ))}
              </ScrollView>
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    fontSize: 16,
  },
  calendarContainer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.xs / 2,
  },
  eventCount: {
    fontSize: 14,
  },
  horizontalScrollContainer: {
    minHeight: 380,
  },
  horizontalScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
  },
});
