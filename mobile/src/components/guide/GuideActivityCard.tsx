import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { Activity } from '@/types/search'
import { Colors, Spacing, Typography } from '@/constants'
import { Button } from '../common'

interface GuideActivityCardProps {
  activity: Activity & {
    bookingCount?: number
    rating?: number
    availabilityCount?: number
  }
  onPress?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onManageAvailability?: () => void
}

export const GuideActivityCard: React.FC<GuideActivityCardProps> = ({
  activity,
  onPress,
  onEdit,
  onDelete,
  onManageAvailability,
}) => {
  const isDark = useColorScheme() === 'dark'

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 12,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: activity.isActive ? Colors.success : Colors.error,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    title: {
      fontSize: Typography.fontSize.base,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      flex: 1,
      marginRight: Spacing.sm,
    },
    statusBadge: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: activity.isActive ? Colors.success + '20' : Colors.error + '20',
    },
    statusText: {
      fontSize: Typography.fontSize.xs,
      fontWeight: '600',
      color: activity.isActive ? Colors.success : Colors.error,
    },
    description: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.sm,
      lineHeight: 18,
    },
    meta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.md,
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: isDark ? Colors.dark.border : Colors.light.border,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    metaText: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginLeft: Spacing.xs,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    actionButton: {
      flex: 1,
    },
  })

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{activity.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {activity.description}
      </Text>

      {/* Metadata */}
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text style={styles.metaText}>{activity.city}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="attach-money" size={16} color={Colors.success} />
          <Text style={styles.metaText}>${activity.price.toFixed(2)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={16} color={Colors.info} />
          <Text style={styles.metaText}>{activity.maxParticipants}</Text>
        </View>
      </View>

      {/* Stats */}
      {(activity.bookingCount || activity.rating || activity.availabilityCount) && (
        <View style={styles.meta}>
          {activity.rating !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={Colors.warning} />
              <Text style={styles.metaText}>{activity.rating.toFixed(1)}</Text>
            </View>
          )}
          {activity.bookingCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
              <Text style={styles.metaText}>{activity.bookingCount} bookings</Text>
            </View>
          )}
          {activity.availabilityCount !== undefined && (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={Colors.info} />
              <Text style={styles.metaText}>{activity.availabilityCount} slots</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={onPress || (() => {})}
          style={styles.actionButton}
        >
          View
        </Button>
        <Button
          variant="outline"
          onPress={onManageAvailability || (() => {})}
          style={styles.actionButton}
        >
          Slots
        </Button>
        <Button
          variant="outline"
          onPress={onEdit || (() => {})}
          style={styles.actionButton}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          onPress={onDelete || (() => {})}
          style={styles.actionButton}
        >
          Delete
        </Button>
      </View>
    </View>
  )
}
