import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { ActivityAvailability } from '@/types/booking'
import { Colors, Spacing, Typography } from '@/constants'

interface AvailabilitySlotCardProps {
  slot: ActivityAvailability
  onEdit: () => void
  onDelete: () => void
}

export const AvailabilitySlotCard: React.FC<AvailabilitySlotCardProps> = ({
  slot,
  onEdit,
  onDelete,
}) => {
  const isDark = useColorScheme() === 'dark'

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 8,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      borderLeftWidth: 3,
      borderLeftColor: Colors.primary,
    },
    content: {
      flex: 1,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    timeText: {
      fontSize: Typography.fontSize.base,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginLeft: Spacing.xs,
    },
    dateText: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginBottom: Spacing.xs,
    },
    spotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spotsText: {
      fontSize: Typography.fontSize.sm,
      color: Colors.info,
      marginLeft: Spacing.xs,
      fontWeight: '500',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    actionButton: {
      padding: Spacing.sm,
      borderRadius: 8,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
    },
  })

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.dateText}>{formatDate(slot.date)}</Text>
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color={Colors.primary} />
          <Text style={styles.timeText}>
            {slot.startTime} - {slot.endTime}
          </Text>
        </View>
        <View style={styles.spotsRow}>
          <Ionicons name="people-outline" size={14} color={Colors.info} />
          <Text style={styles.spotsText}>{slot.availableSpots} spots available</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={18} color={Colors.warning} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  )
}
