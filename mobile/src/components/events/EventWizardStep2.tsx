import React from 'react'
import { ScrollView, Text, StyleSheet, useColorScheme, View, TouchableOpacity, Switch } from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'
import { Card } from '@/components/common'
import { RecurrencePattern } from '@/types/event'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'

interface EventWizardStep2Props {
  startDateTime: string
  endDateTime: string
  isRecurring: boolean
  recurrencePattern?: RecurrencePattern
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
  onRecurringToggle: (recurring: boolean) => void
  onRecurrencePatternChange: (pattern: RecurrencePattern) => void
  isLoading?: boolean
}

type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'none'

export const EventWizardStep2: React.FC<EventWizardStep2Props> = ({
  startDateTime,
  endDateTime,
  isRecurring,
  recurrencePattern,
  onStartDateChange,
  onEndDateChange,
  onRecurringToggle,
  onRecurrencePatternChange,
  isLoading = false,
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const startDate = new Date(startDateTime)
  const endDate = new Date(endDateTime)

  const [showStartPicker, setShowStartPicker] = React.useState(false)
  const [showEndPicker, setShowEndPicker] = React.useState(false)
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false)
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false)

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onStartDateChange(selectedDate)
    }
    setShowStartPicker(false)
  }

  const handleStartTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onStartDateChange(selectedDate)
    }
    setShowStartTimePicker(false)
  }

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onEndDateChange(selectedDate)
    }
    setShowEndPicker(false)
  }

  const handleEndTimeChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      onEndDateChange(selectedDate)
    }
    setShowEndTimePicker(false)
  }

  const handleRecurrenceTypeChange = (type: RecurrenceType) => {
    if (type === 'none') {
      onRecurringToggle(false)
    } else {
      onRecurringToggle(true)
      onRecurrencePatternChange({
        type,
        interval: 1,
        daysOfWeek: type === 'weekly' ? [startDate.getDay()] : undefined,
        endDate: undefined,
      })
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear(),
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const recurrenceType: RecurrenceType = isRecurring ? (recurrencePattern?.type as RecurrenceType) : 'none'

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepTitle}>Date & Time</Text>
      <Text style={styles.stepDescription}>
        Set when your event starts and ends. You can make it recurring if needed.
      </Text>

      {/* Start Date & Time */}
      <View style={styles.section}>
        <Text style={styles.label}>Start Date & Time *</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
            disabled={isLoading}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartTimePicker(true)}
            disabled={isLoading}
          >
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={styles.dateButtonText}>{formatTime(startDate)}</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
          />
        )}
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate}
            mode="time"
            display="spinner"
            onChange={handleStartTimeChange}
            is24Hour={false}
          />
        )}
      </View>

      {/* End Date & Time */}
      <View style={styles.section}>
        <Text style={styles.label}>End Date & Time *</Text>
        <View style={styles.dateTimeRow}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
            disabled={isLoading}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
            <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndTimePicker(true)}
            disabled={isLoading}
          >
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <Text style={styles.dateButtonText}>{formatTime(endDate)}</Text>
          </TouchableOpacity>
        </View>

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="spinner"
            onChange={handleEndDateChange}
          />
        )}
        {showEndTimePicker && (
          <DateTimePicker
            value={endDate}
            mode="time"
            display="spinner"
            onChange={handleEndTimeChange}
            is24Hour={false}
          />
        )}
      </View>

      {/* Recurrence */}
      <View style={styles.section}>
        <View style={styles.recurrenceLabelRow}>
          <Text style={styles.label}>Recurring Event?</Text>
          <Switch
            value={isRecurring}
            onValueChange={onRecurringToggle}
            disabled={isLoading}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        {isRecurring && (
          <View style={styles.recurrenceOptions}>
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.recurrenceButton,
                  recurrenceType === type && styles.recurrenceButtonActive,
                ]}
                onPress={() => handleRecurrenceTypeChange(type)}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.recurrenceButtonText,
                    recurrenceType === type && styles.recurrenceButtonTextActive,
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Duration Info Card */}
      <Card style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Duration</Text>
          <Text style={styles.infoText}>
            {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))} hours
          </Text>
        </View>
      </Card>

      {isRecurring && (
        <Card style={styles.infoPrimary}>
          <Ionicons name="repeat-outline" size={20} color="#fff" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitleLight}>Repeating {recurrenceType}</Text>
            <Text style={styles.infoTextLight}>New events created for each occurrence</Text>
          </View>
        </Card>
      )}
    </ScrollView>
  )
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    stepTitle: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.xs,
    },
    stepDescription: {
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
      marginBottom: Spacing.lg,
      lineHeight: 20,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    dateTimeRow: {
      flexDirection: 'row',
      gap: Spacing.md,
    },
    dateButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    dateButtonText: {
      fontSize: Typography.fontSize.body,
      color: theme.text,
      fontWeight: '500',
    },
    recurrenceLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    recurrenceOptions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    recurrenceButton: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.background,
    },
    recurrenceButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    recurrenceButtonText: {
      fontSize: Typography.fontSize.small,
      color: theme.text,
      fontWeight: '500',
      textAlign: 'center',
    },
    recurrenceButtonTextActive: {
      color: '#fff',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.lg,
      backgroundColor: theme.surface,
      borderRadius: 12,
    },
    infoPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.lg,
      backgroundColor: theme.primary,
      borderRadius: 12,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
      color: theme.grayText,
      marginBottom: Spacing.xs,
    },
    infoTitleLight: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
      color: '#fff',
      marginBottom: Spacing.xs,
    },
    infoText: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
    },
    infoTextLight: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: '#fff',
    },
  })
