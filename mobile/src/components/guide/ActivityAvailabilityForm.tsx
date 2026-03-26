import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native'
import { CreateActivityFormData } from '@/types/guide'
import { Colors, Spacing, Typography } from '@/constants'
import { Button } from '../common'

interface ActivityAvailabilityFormProps {
  initialData?: Partial<CreateActivityFormData>
  onSubmit: (data: Partial<CreateActivityFormData>) => void
  onBack: () => void
  onCancel: () => void
}

export const ActivityAvailabilityForm: React.FC<ActivityAvailabilityFormProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const isDark = useColorScheme() === 'dark'
  const [skipAvailability, setSkipAvailability] = useState(false)
  const [date, setDate] = useState(initialData?.availabilityDate || '')
  const [startTime, setStartTime] = useState(initialData?.startTime || '')
  const [endTime, setEndTime] = useState(initialData?.endTime || '')
  const [spots, setSpots] = useState(initialData?.availableSpots?.toString() || '')

  const isDateValid = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const isTimeValid = (time: string) => /^\d{2}:\d{2}$/.test(time)
  const isValid =
    skipAvailability ||
    (isDateValid &&
      isTimeValid(startTime) &&
      isTimeValid(endTime) &&
      spots &&
      parseInt(spots) > 0)

  const handleSubmit = () => {
    if (skipAvailability) {
      onSubmit({})
    } else if (isValid) {
      onSubmit({
        availabilityDate: date,
        startTime,
        endTime,
        availableSpots: parseInt(spots),
      })
    }
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    header: {
      marginBottom: Spacing.md,
    },
    title: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    separator: {
      height: 2,
      backgroundColor: isDark ? Colors.dark.border : Colors.light.border,
      marginBottom: Spacing.lg,
    },
    progressBar: {
      height: 2,
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderRadius: 999,
      marginBottom: Spacing.lg,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: Colors.primary,
    },
    infoBox: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      padding: Spacing.md,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: Colors.primary,
      marginBottom: Spacing.lg,
    },
    skipBox: {
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      padding: Spacing.md,
      borderRadius: 8,
      borderLeftWidth: 4,
      borderLeftColor: Colors.info,
      marginBottom: Spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      marginRight: Spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    checkboxText: {
      color: 'white',
      fontWeight: 'bold',
    },
    skipTextContainer: {
      flex: 1,
    },
    skipTitle: {
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.xs,
    },
    skipSubtitle: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    infoText: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    formGroup: {
      marginBottom: Spacing.lg,
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '500',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: Spacing.md,
      fontSize: Typography.fontSize.md,
      color: isDark ? Colors.dark.text : Colors.light.text,
      borderColor: isDark ? Colors.dark.border : Colors.light.border,
      backgroundColor: isDark ? Colors.dark.surface : Colors.light.surface,
      minHeight: 48,
    },
    helperText: {
      fontSize: Typography.fontSize.xs,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      marginTop: Spacing.xs,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
    backButton: {
      flex: 1,
    },
  })

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set Availability</Text>
          <Text style={styles.subtitle}>
            Step 4 of 4: Create your first availability slot (optional)
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>

        {/* Skip Option */}
        <TouchableOpacity
          style={styles.skipBox}
          onPress={() => setSkipAvailability(!skipAvailability)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, skipAvailability && styles.checkboxChecked]}>
            {skipAvailability && <Text style={styles.checkboxText}>✓</Text>}
          </View>
          <View style={styles.skipTextContainer}>
            <Text style={styles.skipTitle}>Skip for now</Text>
            <Text style={styles.skipSubtitle}>
              You can add availability later from your dashboard
            </Text>
          </View>
        </TouchableOpacity>

        {!skipAvailability && (
          <>
            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Add your first availability slot. You can add more times and bulk recurrence patterns from your dashboard.
              </Text>
            </View>

            {/* Date Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
              <TextInput
                style={styles.input}
                placeholder={getTodayDate()}
                placeholderTextColor={isDark ? Colors.dark.placeholder : Colors.light.placeholder}
                value={date}
                onChangeText={setDate}
              />
              <Text style={styles.helperText}>Format: YYYY-MM-DD (e.g., 2026-03-15)</Text>
            </View>

            {/* Start Time */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Time (HH:mm) *</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={isDark ? Colors.dark.placeholder : Colors.light.placeholder}
                value={startTime}
                onChangeText={setStartTime}
              />
              <Text style={styles.helperText}>24-hour format (e.g., 09:00)</Text>
            </View>

            {/* End Time */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>End Time (HH:mm) *</Text>
              <TextInput
                style={styles.input}
                placeholder="17:00"
                placeholderTextColor={isDark ? Colors.dark.placeholder : Colors.light.placeholder}
                value={endTime}
                onChangeText={setEndTime}
              />
              <Text style={styles.helperText}>24-hour format (e.g., 17:00)</Text>
            </View>

            {/* Available Spots */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Available Spots *</Text>
              <TextInput
                style={styles.input}
                placeholder="10"
                placeholderTextColor={isDark ? Colors.dark.placeholder : Colors.light.placeholder}
                value={spots}
                onChangeText={setSpots}
                keyboardType="numeric"
              />
              <Text style={styles.helperText}>Number of spots available for this slot</Text>
            </View>
          </>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <View style={styles.backButton}>
            <Button variant="outline" onPress={onBack}>
              Back
            </Button>
          </View>
          <View style={styles.backButton}>
            <Button onPress={handleSubmit} disabled={!isValid}>
              Create Activity
            </Button>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
