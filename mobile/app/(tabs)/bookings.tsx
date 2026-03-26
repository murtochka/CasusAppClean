import { useEffect } from 'react'
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBookingStore } from '@/store/bookingStore'
import { Ionicons } from '@expo/vector-icons'
import { Button, Card, ErrorBoundary } from '@/components/common'
import { BookingCardSkeleton } from '@/components/skeletons'
import { Colors, Spacing, Typography } from '@/constants'
import { router } from 'expo-router'
import { Booking } from '@/types/booking'

export default function BookingsScreen() {
  const { bookings, isLoading, error, loadBookings, cancelBooking, clearError } = useBookingStore()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error)
      clearError()
    }
  }, [error, clearError])

  const handleCancel = async (id: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(id)
              Alert.alert('Success', 'Booking cancelled successfully')
            } catch (error) {
              console.error('Failed to cancel booking', error)
            }
          },
        },
      ]
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success
      case 'pending':
        return Colors.warning
      case 'cancelled':
        return Colors.error
      default:
        return theme.textSecondary
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'checkmark-circle'
      case 'pending':
        return 'time'
      case 'cancelled':
        return 'close-circle'
      default:
        return 'help-circle'
    }
  }

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <Card style={styles.bookingCard} onPress={() => router.push(`/activity/${item.activityId}`)}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.bookingTitle, { color: theme.text }]}>
            Booking #{item.id.substring(0, 8).toUpperCase()}
          </Text>
          <View style={styles.statusBadge}>
            <Ionicons 
              name={getStatusIcon(item.status) as any} 
              size={14} 
              color={getStatusColor(item.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
        {item.status === 'confirmed' && (
          <Pressable 
            onPress={() => handleCancel(item.id)} 
            style={styles.cancelButton}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="close-circle-outline" size={20} color={Colors.error} />
          </Pressable>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            {item.participants} {item.participants === 1 ? 'participant' : 'participants'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.priceText, { color: Colors.primary }]}>
            €{item.totalPrice.toFixed(2)}
          </Text>
        </View>
      </View>

      {item.status === 'confirmed' && (
        <Button 
          variant="outline" 
          size="sm" 
          style={styles.viewButton}
          onPress={() => router.push(`/activity/${item.activityId}`)}
        >
          View Activity
        </Button>
      )}
    </Card>
  )

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: Colors.primary }]}>My Bookings</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </Text>
          </View>

          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3].map((i) => (
                  <BookingCardSkeleton key={i} />
                ))}
              </View>
            ) : bookings.length === 0 ? (
              <View style={styles.centerWrap}>
                <Ionicons name="calendar-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
                  No bookings yet
                </Text>
                <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                  Book your first adventure and start exploring
                </Text>
                <Button 
                  onPress={() => router.push('/(tabs)/search')} 
                  style={styles.emptyButton}
                >
                  Explore Activities
                </Button>
              </View>
            ) : (
              <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                renderItem={renderBookingCard}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.lg, 
    borderBottomWidth: 1 
  },
  headerTitle: { 
    fontSize: Typography.fontSize['6xl'], 
    fontFamily: Typography.fontFamily.bold 
  },
  headerSub: { 
    marginTop: Spacing.xs, 
    fontSize: Typography.fontSize.md, 
    fontFamily: Typography.fontFamily.regular 
  },
  content: { 
    flex: 1 
  },
  listContainer: { 
    paddingHorizontal: Spacing.xl, 
    paddingVertical: Spacing.lg 
  },
  centerWrap: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl 
  },
  skeletonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  loadingText: { 
    marginTop: Spacing.md, 
    fontSize: Typography.fontSize.lg, 
    fontFamily: Typography.fontFamily.regular 
  },
  emptyTitle: { 
    marginTop: Spacing.md, 
    fontSize: Typography.fontSize['3xl'], 
    fontFamily: Typography.fontFamily.semibold 
  },
  emptyText: { 
    marginTop: Spacing.xs, 
    textAlign: 'center', 
    fontSize: Typography.fontSize.md, 
    fontFamily: Typography.fontFamily.regular 
  },
  emptyButton: { 
    marginTop: Spacing.lg 
  },
  bookingCard: { 
    marginBottom: Spacing.md 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: Spacing.sm 
  },
  bookingTitle: { 
    fontSize: Typography.fontSize.lg, 
    fontFamily: Typography.fontFamily.bold 
  },
  statusBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: Spacing.xs,
    gap: Spacing.xs 
  },
  statusText: { 
    fontSize: Typography.fontSize.sm, 
    fontFamily: Typography.fontFamily.semibold 
  },
  cancelButton: { 
    padding: Spacing.xs 
  },
  cardContent: { 
    gap: Spacing.sm 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.sm 
  },
  infoText: { 
    fontSize: Typography.fontSize.md, 
    fontFamily: Typography.fontFamily.regular 
  },
  priceText: { 
    fontSize: Typography.fontSize.lg, 
    fontFamily: Typography.fontFamily.bold 
  },
  viewButton: { 
    marginTop: Spacing.md 
  },
})
