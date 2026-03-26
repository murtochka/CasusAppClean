import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'
import { Button } from '../common'

interface QuickAddAvailabilityFormProps {
  activityId: string
  onAdd: (date: string, startTime: string, endTime: string, spots: number) => Promise<void>
  onCancel: () => void
}

export const QuickAddAvailabilityForm: React.FC<QuickAddAvailabilityFormProps> = ({
  onAdd,
  onCancel,
}) => {
  const isDark = useColorScheme() === 'dark'

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [spots, setSpots] = useState('')
  const [loading, setLoading] = useState(false)

  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const isValidTime = (time: string) => /^\d{2}:\d{2}$/.test(time)
  const isValid =
    isValidDate &&
    isValidTime(startTime) &&
    isValidTime(endTime) &&
    spots &&
    parseInt(spots) > 0

  const handleAdd = async () => {
    if (!isValid) return

    try {
      setLoading(true)
      await onAdd(date, startTime, endTime, parseInt(spots))
      // Reset form
      setDate('')
      setStartTime('')
      setEndTime('')
      setSpots('')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add availability')
    } finally {
      setLoading(false)
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 12,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    closeButton: {
      padding: Spacing.xs,
    },
    form: {
      gap: Spacing.md,
    },
    field: {
      marginBottom: Spacing.sm,
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      borderRadius: 8,
      padding: Spacing.md,
      color: isDark ? Colors.dark.text : Colors.light.text,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
      fontSize: Typography.fontSize.base,
    },
    hint: {
      fontSize: Typography.fontSize.xs,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.xs,
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    halfField: {
      flex: 1,
    },
    buttons: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.md,
    },
  })

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Availability Slot</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Ionicons name="close" size={24} color={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            placeholder={getTodayDate()}
            value={date}
            onChangeText={setDate}
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
        </View>

        {/* Time Range */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Start Time</Text>
            <TextInput
              placeholder="09:00"
              value={startTime}
              onChangeText={setStartTime}
              style={styles.input}
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
            />
            <Text style={styles.hint}>HH:mm</Text>
          </View>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>End Time</Text>
            <TextInput
              placeholder="17:00"
              value={endTime}
              onChangeText={setEndTime}
              style={styles.input}
              placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
            />
            <Text style={styles.hint}>HH:mm</Text>
          </View>
        </View>

        {/* Available Spots */}
        <View style={styles.field}>
          <Text style={styles.label}>Available Spots</Text>
          <TextInput
            placeholder="e.g., 8"
            value={spots}
            onChangeText={setSpots}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <Button variant="outline" onPress={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onPress={handleAdd} disabled={!isValid || loading}>
          {loading ? 'Adding...' : 'Add Slot'}
        </Button>
      </View>
    </View>
  )
}
