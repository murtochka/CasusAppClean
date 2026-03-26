import { View, Text, StyleSheet, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'
import { Card, Badge, Button } from '../common'
import type { BookingWithDetails } from '@/types/booking'

interface GuideBookingCardProps {
  booking: BookingWithDetails
  onPress?: () => void
}

export function GuideBookingCard({ booking, onPress }: GuideBookingCardProps) {
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const statusVariant =
    booking.status === 'confirmed'
      ? 'success'
      : booking.status === 'pending'
      ? 'warning'
      : booking.status === 'cancelled'
      ? 'error'
      : 'default'

  const bookingDate = new Date(booking.availability.date)
  const formattedDate = bookingDate.toLocaleDateString()

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={[styles.activityTitle, { color: theme.text }]} numberOfLines={1}>
            {booking.activity.title}
          </Text>
          <Text style={[styles.touristName, { color: theme.textSecondary }]} numberOfLines={1}>
            {booking.user.fullName}
          </Text>
        </View>
        <Badge label={booking.status} variant={statusVariant} size="sm" />
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}> {formattedDate}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}> {booking.availability.startTime}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}> {booking.participants} participants</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.metaText, { color: theme.textSecondary }]}> ${Number(booking.totalPrice).toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.bookingId, { color: theme.textTertiary }]}>Booking #{booking.id.slice(0, 8)}</Text>
        <Button size="sm" variant="outline" onPress={onPress || (() => {})}>
          View Details
        </Button>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  touristName: {
    fontSize: Typography.fontSize.sm,
    marginTop: 2,
  },
  metaGrid: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
  },
  footer: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    fontSize: Typography.fontSize.xs,
  },
})
