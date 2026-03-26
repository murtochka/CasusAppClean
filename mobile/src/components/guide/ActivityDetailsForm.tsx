import React, { useState } from 'react'
import { View, Text as RNText, TextInput, ScrollView, StyleSheet } from 'react-native'
import { CreateActivityFormData } from '@/types/guide'
import { Colors, Spacing, Typography } from '@/constants'
import { useColorScheme } from 'react-native'
import { Button } from '@/components/common'

interface ActivityDetailsFormProps {
  initialData?: Partial<CreateActivityFormData>
  onNext: (data: Partial<CreateActivityFormData>) => void
  onBack: () => void
  onCancel: () => void
}

export const ActivityDetailsForm: React.FC<ActivityDetailsFormProps> = ({
  initialData,
  onNext,
  onBack,
  onCancel,
}) => {
  const isDark = useColorScheme() === 'dark'
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [maxParticipants, setMaxParticipants] = useState(initialData?.maxParticipants?.toString() || '')
  const [duration, setDuration] = useState(initialData?.durationMinutes?.toString() || '')
  const [meetingPoint, setMeetingPoint] = useState(initialData?.meetingPoint || '')
  const [city, setCity] = useState(initialData?.city || '')
  const [country, setCountry] = useState(initialData?.country || '')

  const isValid =
    price &&
    parseInt(price) > 0 &&
    maxParticipants &&
    parseInt(maxParticipants) > 0 &&
    duration &&
    parseInt(duration) > 0 &&
    meetingPoint.trim().length > 0 &&
    city.trim().length > 0 &&
    country.trim().length > 0

  const handleNext = () => {
    if (isValid) {
      onNext({
        price: parseFloat(price),
        maxParticipants: parseInt(maxParticipants),
        durationMinutes: parseInt(duration),
        meetingPoint: meetingPoint.trim(),
        city: city.trim(),
        country: country.trim(),
      })
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    title: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.sm,
    },
    subtitle: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    progress: {
      height: 2,
      flexDirection: 'row',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    progressFill: {
      flex: 2,
      backgroundColor: Colors.primary,
    },
    progressEmpty: {
      flex: 2,
      backgroundColor: isDark ? Colors.dark.border : Colors.light.border,
    },
    form: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    field: {
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.sm,
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
    buttons: {
      flexDirection: 'row',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.lg,
      paddingTop: Spacing.md,
    },
  })

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RNText style={styles.title}>Activity Details</RNText>
        <RNText style={styles.subtitle}>Step 2 of 4: Pricing & Logistics</RNText>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progress, { paddingHorizontal: Spacing.lg }]}>
        <View style={[styles.progressFill]} />
        <View style={[styles.progressFill]} />
        <View style={{ flex: 2, backgroundColor: isDark ? Colors.dark.border : Colors.light.border }} />
      </View>

      <View style={styles.form}>
        {/* Price */}
        <View style={styles.field}>
          <RNText style={styles.label}>Price per Person (USD)</RNText>
          <TextInput
            placeholder="e.g., 75.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>

        {/* Max Participants */}
        <View style={styles.field}>
          <RNText style={styles.label}>Max Participants</RNText>
          <TextInput
            placeholder="e.g., 8"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <RNText style={styles.label}>Duration (minutes)</RNText>
          <TextInput
            placeholder="e.g., 180"
            value={duration}
            onChangeText={setDuration}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>

        {/* Meeting Point */}
        <View style={styles.field}>
          <RNText style={styles.label}>Meeting Point</RNText>
          <TextInput
            placeholder="e.g., Eiffel Tower main entrance"
            value={meetingPoint}
            onChangeText={setMeetingPoint}
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>

        {/* City */}
        <View style={styles.field}>
          <RNText style={styles.label}>City</RNText>
          <TextInput
            placeholder="e.g., Paris"
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>

        {/* Country */}
        <View style={styles.field}>
          <RNText style={styles.label}>Country</RNText>
          <TextInput
            placeholder="e.g., France"
            value={country}
            onChangeText={setCountry}
            style={styles.input}
            placeholderTextColor={isDark ? Colors.dark.textSecondary : Colors.light.textSecondary}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <Button variant="outline" onPress={onCancel}>
          Cancel
        </Button>
        <Button variant="outline" onPress={onBack}>
          Back
        </Button>
        <Button onPress={handleNext} disabled={!isValid}>
          Next
        </Button>
      </View>
    </ScrollView>
  )
}
