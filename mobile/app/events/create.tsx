import { SafeAreaView, StyleSheet, Text, useColorScheme, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { useEventStore } from '@/store/eventStore'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button, Card } from '@/components/common'
import { Colors, Spacing, Typography } from '@/constants'
import { EventWizardStep1 } from '@/components/events/EventWizardStep1'
import { EventWizardStep2 } from '@/components/events/EventWizardStep2'
import { EventWizardStep3 } from '@/components/events/EventWizardStep3'
import { EventWizardStep4 } from '@/components/events/EventWizardStep4'
import { RecurrencePattern } from '@/types/event'
import { useEffect, useState } from 'react'

const STEPS = ['Details', 'Date & Time', 'Location', 'Showcase']
const TOTAL_STEPS = STEPS.length

export default function CreateEventScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const { wizardState, createEvent, updateWizardData } = useEventStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [businessLocation, setBusinessLocation] = useState<any>(null)

  // Load categories and business location on mount
  useEffect(() => {
    loadCategories()
    loadBusinessLocation()
  }, [])

  // Redirect if not a guide user
  useEffect(() => {
    if (user && user.role !== 'guide') {
      Alert.alert('Access Denied', 'Only business users can create events', [
        { text: 'OK', onPress: () => router.back() },
      ])
    }
  }, [user])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      // Fetch categories from your API
      // For now, using mock data - replace with actual API call
      const mockCategories = [
        { id: '1', name: 'Adventure' },
        { id: '2', name: 'Cultural' },
        { id: '3', name: 'Food & Drink' },
        { id: '4', name: 'Shopping' },
        { id: '5', name: 'Nightlife' },
        { id: '6', name: 'Sports' },
        { id: '7', name: 'Arts' },
        { id: '8', name: 'History' },
      ]
      setCategories(mockCategories)
    } catch (err) {
      console.error('Failed to load categories:', err)
      Alert.alert('Error', 'Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const loadBusinessLocation = async () => {
    try {
      // Fetch business location from API or user profile
      // For now, setting default - will be populated when API integration is complete
      setBusinessLocation(null)
    } catch (err) {
      console.error('Failed to load business location:', err)
    }
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0: // Details
        return (
          wizardState.title.trim().length > 0 &&
          wizardState.categoryIds.length > 0 &&
          wizardState.title.length <= 100
        )
      case 1: // Date & Time
        const startDate = new Date(wizardState.startDateTime)
        const endDate = new Date(wizardState.endDateTime)
        return startDate < endDate
      case 2: // Location
        return (
          wizardState.address.trim().length > 0 &&
          wizardState.city.trim().length > 0
        )
      case 3: // Showcase
        return true // All inputs are optional
      default:
        return false
    }
  }

  const handleNextStep = () => {
    if (validateStep()) {
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      getValidationErrorMessage()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getValidationErrorMessage = (): string => {
    switch (currentStep) {
      case 0:
        if (!wizardState.title.trim()) return 'Event name is required'
        if (!wizardState.categoryId) return 'Please select a category'
        return 'Please fill in all required fields'
      case 1:
        const startDate = new Date(wizardState.startDateTime)
        const endDate = new Date(wizardState.endDateTime)
        if (startDate >= endDate) return 'End date must be after start date'
        return 'Please set valid dates'
      case 2:
        if (!wizardState.address.trim()) return 'Address is required'
        if (!wizardState.city.trim()) return 'City is required'
        return 'Please fill in location'
      default:
        return 'Please check your input'
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) {
      Alert.alert('Validation Error', getValidationErrorMessage())
      return
    }

    try {
      setSubmitting(true)
      const newEvent = await createEvent({
        title: wizardState.title,
        description: wizardState.description,
        categoryId: wizardState.categoryId,
        startDateTime: wizardState.startDateTime,
        endDateTime: wizardState.endDateTime,
        address: wizardState.address,
        city: wizardState.city,
        latitude: wizardState.latitude,
        longitude: wizardState.longitude,
        coverImageUrl: wizardState.coverImageUrl,
        capacity: wizardState.capacity || 0,
        pricePerPerson: wizardState.pricePerPerson || 0,
        tags: wizardState.tags,
        isRecurring: wizardState.isRecurring,
        recurrencePattern: wizardState.recurrencePattern,
      })

      Alert.alert('Success!', 'Event created as draft. You can edit or publish it from My Events.', [
        {
          text: 'View Event',
          onPress: () => router.push(`/events/${newEvent.id}`),
        },
        {
          text: 'Go to My Events',
          onPress: () => router.replace('/events'),
        },
      ])
    } catch (err: any) {
      console.error('Failed to create event:', err)
      Alert.alert('Error', err.message || 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingCategories) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  if (user?.role !== 'guide') {
    return null
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentStep + 1) / TOTAL_STEPS) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {TOTAL_STEPS}
          </Text>
        </View>

        {/* Step Indicators */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.stepsIndicator}
        >
          {STEPS.map((step, index) => (
            <View
              key={step}
              style={[
                styles.stepIndicator,
                index === currentStep ? styles.stepIndicatorActive : null,
                index < currentStep ? styles.stepIndicatorComplete : null,
              ]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    index === currentStep ? styles.stepNumberActive : null,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Step Label */}
        <Text style={styles.stepLabel}>{STEPS[currentStep]}</Text>

        {/* Step Content */}
        <View style={styles.stepContent}>
          {currentStep === 0 && (
            <EventWizardStep1
              title={wizardState.title}
              description={wizardState.description}
              categoryIds={wizardState.categoryIds}
              categories={categories}
              onTitleChange={(text) => updateWizardData({ title: text })}
              onDescriptionChange={(text) => updateWizardData({ description: text })}
              onCategoryChange={(categoryIds) => updateWizardData({ categoryIds })}
              isLoading={submitting}
            />
          )}

          {currentStep === 1 && (
            <EventWizardStep2
              startDateTime={wizardState.startDateTime}
              endDateTime={wizardState.endDateTime}
              isRecurring={wizardState.isRecurring}
              recurrencePattern={wizardState.recurrencePattern}
              onStartDateChange={(date) => updateWizardData({ startDateTime: date.toISOString() })}
              onEndDateChange={(date) => updateWizardData({ endDateTime: date.toISOString() })}
              onRecurringToggle={(recurring) => updateWizardData({ isRecurring: recurring })}
              onRecurrencePatternChange={(pattern) => updateWizardData({ recurrencePattern: pattern })}
              isLoading={submitting}
            />
          )}

          {currentStep === 2 && (
            <EventWizardStep3
              address={wizardState.address}
              city={wizardState.city}
              latitude={wizardState.latitude}
              longitude={wizardState.longitude}
              onAddressChange={(text) => updateWizardData({ address: text })}
              onCityChange={(text) => updateWizardData({ city: text })}
              onLatitudeChange={(value) => updateWizardData({ latitude: value })}
              onLongitudeChange={(value) => updateWizardData({ longitude: value })}
              businessLocation={businessLocation}
              isLoading={submitting}
            />
          )}

          {currentStep === 3 && (
            <EventWizardStep4
              coverImageUrl={wizardState.coverImageUrl}
              tags={wizardState.tags}
              capacity={wizardState.capacity}
              pricePerPerson={wizardState.pricePerPerson}
              onCoverImageChange={(uri) => updateWizardData({ coverImageUrl: uri })}
              onTagsChange={(tags) => updateWizardData({ tags })}
              onCapacityChange={(value) => updateWizardData({ capacity: value })}
              onPriceChange={(value) => updateWizardData({ pricePerPerson: value })}
              isLoading={submitting}
            />
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.footer}>
          <Button
            title="Previous"
            variant="secondary"
            onPress={handlePreviousStep}
            disabled={currentStep === 0 || submitting}
            icon={<Ionicons name="chevron-back" size={20} color={theme.primary} />}
          />

          {currentStep === TOTAL_STEPS - 1 ? (
            <Button
              title={submitting ? 'Creating...' : 'Create Event'}
              onPress={handleSubmit}
              disabled={submitting}
              icon={submitting ? undefined : <Ionicons name="checkmark-done" size={20} color="#fff" />}
              loading={submitting}
            />
          ) : (
            <Button
              title="Next"
              onPress={handleNextStep}
              disabled={submitting}
              icon={<Ionicons name="chevron-forward" size={20} color="#fff" />}
            />
          )}
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: Spacing.lg,
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    backButton: {
      padding: Spacing.sm,
      marginLeft: -Spacing.sm,
    },
    headerTitle: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      color: theme.text,
    },
    headerRight: {
      width: 32,
    },
    progressContainer: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    progressBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      overflow: 'hidden',
      marginBottom: Spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.primary,
    },
    progressText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      textAlign: 'center',
    },
    stepsIndicator: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      gap: Spacing.md,
    },
    stepIndicator: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
    },
    stepIndicatorActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    stepIndicatorComplete: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    stepNumber: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
      color: theme.text,
    },
    stepNumberActive: {
      color: '#fff',
    },
    stepLabel: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.md,
    },
    stepContent: {
      flex: 1,
    },
    footer: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      flexDirection: 'row',
      gap: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
  })
