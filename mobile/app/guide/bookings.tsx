import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
  Alert,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'
import { GuideBookingCardSkeleton } from '@/components/skeletons'
import { useGuideStore } from '@/store/guideStore'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { GuideBookingCard } from '@/components/guide/GuideBookingCard'

type TimeFilter = 'upcoming' | 'past'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled'

export default function GuideBookingsScreen() {
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const { user } = useAuth()

  const { bookings, loading, error, loadBookings, clearError } = useGuideStore()

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [refreshing, setRefreshing] = useState(false)

  const loadFilteredBookings = async () => {
    await loadBookings({
      upcoming: timeFilter === 'upcoming',
      status: statusFilter === 'all' ? undefined : statusFilter,
      page: 1,
      limit: 30,
    })
  }

  useEffect(() => {
    if (user?.role === 'guide') {
      loadFilteredBookings()
    }
  }, [user?.role, timeFilter, statusFilter])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadFilteredBookings()
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to refresh bookings')
    } finally {
      setRefreshing(false)
    }
  }

  if (!user || user.role !== 'guide') {
    return (
      <ErrorBoundary level="route">
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>This section is for guides only</Text>
        </View>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}> 
        <Text style={[styles.headerTitle, { color: Colors.primary }]}>Guide Bookings</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Manage your reservations</Text>
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.row}>
          {(['upcoming', 'past'] as TimeFilter[]).map((filter) => {
            const active = timeFilter === filter
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setTimeFilter(filter)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? Colors.primary : theme.surface,
                    borderColor: active ? Colors.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? '#fff' : theme.text }]}>
                  {filter === 'upcoming' ? 'Upcoming' : 'Past'}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusRow}>
          {(['all', 'pending', 'confirmed', 'cancelled'] as StatusFilter[]).map((filter) => {
            const active = statusFilter === filter
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setStatusFilter(filter)}
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: active ? Colors.primary : theme.surface,
                    borderColor: active ? Colors.primary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.statusText, { color: active ? '#fff' : theme.textSecondary }]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {error ? (
        <View style={[styles.errorBox, { borderColor: Colors.error }]}> 
          <Text style={[styles.errorText, { color: Colors.error }]}>{error}</Text>
          <Button size="sm" variant="outline" onPress={() => { clearError(); loadFilteredBookings() }}>
            Retry
          </Button>
        </View>
      ) : null}

      {loading.bookings && bookings.length === 0 ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <GuideBookingCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        >
          {bookings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No bookings found</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Try changing your filters to see more results.</Text>
            </View>
          ) : (
            bookings.map((booking) => (
              <GuideBookingCard
                key={booking.id}
                booking={booking}
                onPress={() => Alert.alert('Coming Soon', 'Booking detail screen will be added next.')}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.fontSize.lg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  headerSub: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  filterText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  statusRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  errorBox: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loaderText: {
    fontSize: Typography.fontSize.sm,
  },
  skeletonContainer: {
    padding: Spacing.lg,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    marginTop: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
})
