import { StyleSheet, Text, useColorScheme, View, ScrollView, RefreshControl, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { Button, Card } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { GuideDashboardSkeleton } from '@/components/skeletons'
import { Colors, Spacing, Typography } from '@/constants'
import { useEffect, useState } from 'react'
import { useGuideStore } from '@/store/guideStore'
import { useEventStore } from '@/store/eventStore'
import { Ionicons } from '@expo/vector-icons'

export default function GuideDashboardScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const { stats, loading, error, loadStats, refreshDashboard } = useGuideStore()
  const { myEvents, fetchMyEvents } = useEventStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.role === 'business') {
      loadStats()
      fetchMyEvents()
    }
  }, [user])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshDashboard()
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

  if (user?.role !== 'business') {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.center, { backgroundColor: theme.background }]}> 
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>This section is for business users only</Text>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  const bookingTrend = stats 
    ? ((stats.bookingsThisMonth - stats.bookingsLastMonth) / (stats.bookingsLastMonth || 1)) * 100 
    : 0
  const trendColor = bookingTrend >= 0 ? Colors.success : Colors.error
  const trendIcon = bookingTrend >= 0 ? 'trending-up' : 'trending-down'
  const maxMonthlyBookings = Math.max(stats?.bookingsThisMonth || 0, stats?.bookingsLastMonth || 0, 1)
  const thisMonthWidth = `${(((stats?.bookingsThisMonth || 0) / maxMonthlyBookings) * 100).toFixed(0)}%`
  const lastMonthWidth = `${(((stats?.bookingsLastMonth || 0) / maxMonthlyBookings) * 100).toFixed(0)}%`
  const revenueProgress = Math.min(
    ((stats?.revenueThisMonth || 0) / Math.max(stats?.totalRevenue || 1, 1)) * 100,
    100
  )

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          style={[styles.container, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        >
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: Colors.primary }]}>Business Dashboard</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Manage your activities and bookings</Text>
        </View>

        {loading.stats && !stats ? (
          <ScrollView
            style={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          >
            <GuideDashboardSkeleton />
          </ScrollView>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
            <Text style={[styles.errorText, { color: Colors.error }]}>{error}</Text>
            <Button onPress={onRefresh} style={{ marginTop: Spacing.md }}>Retry</Button>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <Card style={[styles.statCard, styles.primaryCard]}>
                <View style={styles.statHeader}>
                  <Ionicons name="list-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={[styles.statValue, { color: Colors.primary }]}>{stats?.totalActivities || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Activities</Text>
              </Card>

              <Card style={[styles.statCard, styles.successCard]}>
                <View style={styles.statHeader}>
                  <Ionicons name="calendar-outline" size={24} color={Colors.success} />
                  {bookingTrend !== 0 && (
                    <View style={styles.trendBadge}>
                      <Ionicons name={trendIcon} size={16} color={trendColor} />
                      <Text style={[styles.trendText, { color: trendColor }]}>
                        {Math.abs(Math.round(bookingTrend))}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.statValue, { color: Colors.success }]}>{stats?.bookingsThisMonth || 0}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bookings This Month</Text>
              </Card>

              <Card style={[styles.statCard, styles.warningCard]}>
                <View style={styles.statHeader}>
                  <Ionicons name="star-outline" size={24} color={Colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: Colors.warning }]}>
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Average Rating</Text>
              </Card>

              <Card style={[styles.statCard, styles.accentCard]}>
                <View style={styles.statHeader}>
                  <Ionicons name="cash-outline" size={24} color={Colors.accent} />
                </View>
                <Text style={[styles.statValue, { color: Colors.accent }]}>
                  ${(stats?.totalRevenue || 0).toFixed(0)}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Revenue</Text>
              </Card>
            </View>

            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Statistics</Text>

              <View style={styles.statRow}>
                <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>Bookings This Month</Text>
                <Text style={[styles.statRowValue, { color: theme.text }]}>{stats?.bookingsThisMonth || 0}</Text>
              </View>
              <View style={[styles.chartTrack, { backgroundColor: theme.surfaceSecondary }]}>
                <View style={[styles.chartFillPrimary, { width: thisMonthWidth as `${number}%` }]} />
              </View>

              <View style={[styles.statRow, { marginTop: Spacing.md }]}> 
                <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>Bookings Last Month</Text>
                <Text style={[styles.statRowValue, { color: theme.text }]}>{stats?.bookingsLastMonth || 0}</Text>
              </View>
              <View style={[styles.chartTrack, { backgroundColor: theme.surfaceSecondary }]}>
                <View style={[styles.chartFillAccent, { width: lastMonthWidth as `${number}%` }]} />
              </View>

              <View style={[styles.statRow, { marginTop: Spacing.lg }]}> 
                <Text style={[styles.statRowLabel, { color: theme.textSecondary }]}>Revenue This Month</Text>
                <Text style={[styles.statRowValue, { color: Colors.accent }]}>${(stats?.revenueThisMonth || 0).toFixed(0)}</Text>
              </View>
              <View style={[styles.chartTrack, { backgroundColor: theme.surfaceSecondary }]}>
                <View style={[styles.chartFillSuccess, { width: `${revenueProgress.toFixed(0)}%` as `${number}%` }]} />
              </View>
            </Card>

            {/* Quick Actions */}
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <Button 
                  icon="add-circle-outline" 
                  onPress={() => router.push('/guide/create-activity')}
                  style={styles.actionButton}
                >
                  Create Activity
                </Button>
                <Button 
                  variant="outline" 
                  icon="time-outline" 
                  onPress={() => router.push('/guide/activities')}
                  style={styles.actionButton}
                >
                  Manage Availability
                </Button>
              </View>
            </Card>

            {/* My Events */}
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>My Events</Text>
                <Button 
                  variant="outline" 
                  size="sm"
                  onPress={() => router.push('/events')}
                >
                  View All
                </Button>
              </View>
              {myEvents && myEvents.length > 0 ? (
                myEvents.slice(0, 3).map((event) => (
                  <View 
                    key={event.id} 
                    style={[styles.listItem, { borderBottomColor: theme.border }]}
                  >
                    <View style={styles.listItemContent}>
                      <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={1}>
                        {event.title}
                      </Text>
                      <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
                        {event.city} • {event.currentAttendees} attendees
                      </Text>
                      <Text style={[styles.listItemMeta, { color: theme.textSecondary }]}>
                        {new Date(event.startDateTime).toLocaleDateString()} at {new Date(event.startDateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getEventStatusColor(event.status) }]}>
                      <Text style={styles.statusBadgeText}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No events yet. Create your first event!
                </Text>
              )}
            </Card>

            {/* Upcoming Bookings */}
            {stats?.recentBookings && stats.recentBookings.length > 0 && (
              <Card style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Bookings</Text>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onPress={() => router.push('/guide/bookings')}
                  >
                    View All
                  </Button>
                </View>
                {stats.recentBookings.slice(0, 3).map((booking) => (
                  <View 
                    key={booking.id} 
                    style={[styles.listItem, { borderBottomColor: theme.border }]}
                  >
                    <View style={styles.listItemContent}>
                      <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={1}>
                        {booking.activityTitle}
                      </Text>
                      <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
                        {booking.userName} • {booking.participants} {booking.participants === 1 ? 'person' : 'people'}
                      </Text>
                      <Text style={[styles.listItemMeta, { color: theme.textSecondary }]}>
                        {new Date(booking.date).toLocaleDateString()} at {booking.startTime}
                      </Text>
                    </View>
                    <Text style={[styles.listItemPrice, { color: Colors.primary }]}>
                      ${parseFloat(booking.totalPrice).toFixed(0)}
                    </Text>
                  </View>
                ))}
              </Card>
            )}

            {/* Recent Reviews */}
            {stats?.recentReviews && stats.recentReviews.length > 0 && (
              <Card style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Reviews</Text>
                {stats.recentReviews.slice(0, 3).map((review) => (
                  <View 
                    key={review.id} 
                    style={[styles.listItem, { borderBottomColor: theme.border }]}
                  >
                    <View style={styles.listItemContent}>
                      <View style={styles.reviewHeader}>
                        <Text style={[styles.listItemTitle, { color: theme.text }]} numberOfLines={1}>
                          {review.activityTitle}
                        </Text>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={14} color={Colors.warning} />
                          <Text style={[styles.ratingText, { color: theme.text }]}>{review.rating}</Text>
                        </View>
                      </View>
                      <Text style={[styles.listItemSubtitle, { color: theme.textSecondary }]}>
                        {review.userName}
                      </Text>
                      {review.comment && (
                        <Text style={[styles.reviewComment, { color: theme.text }]} numberOfLines={2}>
                          "{review.comment}"
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </Card>
            )}

            {/* Empty State */}
            {(!stats?.totalActivities || stats.totalActivities === 0) && (
              <Card style={styles.emptyState}>
                <Ionicons name="rocket-outline" size={64} color={Colors.primary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Get Started</Text>
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  Create your first activity to start receiving bookings!
                </Text>
                <Button 
                  onPress={() => Alert.alert('Coming Soon', 'Activity creation wizard will be available soon!')}
                  style={{ marginTop: Spacing.md }}
                >
                  Create First Activity
                </Button>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
    </ErrorBoundary>
  )
}

const getEventStatusColor = (status: string): string => {
  switch (status) {
    case 'draft':
      return '#FFA500'
    case 'published':
      return '#4CAF50'
    case 'cancelled':
      return '#F44336'
    case 'completed':
      return '#2196F3'
    default:
      return '#999'
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: Spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.regular,
  },
  header: { 
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.lg, 
    borderBottomWidth: 1,
  },
  headerTitle: { 
    fontSize: Typography.fontSize['6xl'], 
    fontFamily: Typography.fontFamily.bold,
  },
  headerSub: { 
    marginTop: Spacing.xs, 
    fontSize: Typography.fontSize.md, 
    fontFamily: Typography.fontFamily.regular,
  },
  content: { 
    flex: 1, 
    paddingHorizontal: Spacing.xl, 
    paddingTop: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['4xl'],
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  statCard: { 
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  primaryCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  successCard: { borderLeftWidth: 4, borderLeftColor: Colors.success },
  warningCard: { borderLeftWidth: 4, borderLeftColor: Colors.warning },
  accentCard: { borderLeftWidth: 4, borderLeftColor: Colors.accent },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: { 
    fontSize: Typography.fontSize['6xl'], 
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.xs,
  },
  statLabel: { 
    fontSize: Typography.fontSize.sm, 
    fontFamily: Typography.fontFamily.regular,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  trendText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
  },
  section: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statRowLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  statRowValue: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  chartTrack: {
    height: 8,
    borderRadius: Spacing.radius.full,
    overflow: 'hidden',
  },
  chartFillPrimary: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  chartFillAccent: {
    height: '100%',
    backgroundColor: Colors.warning,
  },
  chartFillSuccess: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  listItemContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  listItemTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: Spacing.xs,
  },
  listItemSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.xs,
  },
  listItemMeta: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  listItemPrice: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
  reviewComment: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: '#fff',
  },
})
