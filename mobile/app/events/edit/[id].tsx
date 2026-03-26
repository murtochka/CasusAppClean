import { SafeAreaView, StyleSheet, Text, useColorScheme, View, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/hooks/useAuth'
import { useEventStore } from '@/store/eventStore'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/common'
import { Colors, Spacing, Typography } from '@/constants'
import { EventWizardStep1 } from '@/components/events/EventWizardStep1'
import { EventWizardStep2 } from '@/components/events/EventWizardStep2'
import { EventWizardStep3 } from '@/components/events/EventWizardStep3'
import { EventWizardStep4 } from '@/components/events/EventWizardStep4'
import { useEffect, useState } from 'react'

const STEPS = ['Details', 'Date & Time', 'Location', 'Showcase']
const TOTAL_STEPS = STEPS.length

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const { selectedEvent, fetchEventById, updateEvent } = useEventStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Local form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryIds: [] as string[], // Multi-category support
    startDateTime: new Date().toISOString(),
    endDateTime: new Date(Date.now() + 3600000).toISOString(),
    address: '',
    city: '',
    latitude: 0,
    longitude: 0,
    coverImageUrl: '',
    tags: [] as string[],
    capacity: 0,
    pricePerPerson: 0,
    isRecurring: false,
    recurrencePattern: undefined,
  })

  useEffect(() => {
    if (id) {
      loadEvent()
      loadCategories()
    }
  }, [id])

  // Populate form when event loads
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description,
        categoryIds: selectedEvent.categoryIds || [], // Multi-category support
        startDateTime: selectedEvent.startDateTime,
        endDateTime: selectedEvent.endDateTime,
        address: selectedEvent.address,
        city: selectedEvent.city,
        latitude: selectedEvent.latitude || 0,
        longitude: selectedEvent.longitude || 0,
        coverImageUrl: selectedEvent.coverImageUrl || '',
        tags: selectedEvent.tags || [],
        capacity: selectedEvent.maxAttendees || 0,
        pricePerPerson: selectedEvent.pricePerPerson || 0,
        isRecurring: selectedEvent.isRecurring || false,
        recurrencePattern: selectedEvent.recurrencePattern,
      })
      setLoading(false)
    }
  }, [selectedEvent])

  const loadEvent = async () => {
    try {
      await fetchEventById(id!)
    } catch (err: any) {
      console.error('Failed to load event:', err)
      Alert.alert('Error', 'Failed to load event')
      router.back()
    }
  }

  const loadCategories = async () => {
    try {
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
    } finally {
      setLoadingCategories(false)
    }
  }

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.title.trim().length > 0 && formData.categoryIds.length > 0
      case 1:
        const startDate = new Date(formData.startDateTime)
        const endDate = new Date(formData.endDateTime)
        return startDate < endDate
      case 2:
        return formData.address.trim().length > 0 && formData.city.trim().length > 0
      case 3:
        return true
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
      const message = getValidationErrorMessage()
      Alert.alert('Validation Error', message)
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
        if (!formData.title.trim()) return 'Event name is required'
        if (!formData.categoryId) return 'Please select a category'
        return 'Please fill in all required fields'
      case 1:
        const startDate = new Date(formData.startDateTime)
        const endDate = new Date(formData.endDateTime)
        if (startDate >= endDate) return 'End date must be after start date'
        return 'Please set valid dates'
      case 2:
        if (!formData.address.trim()) return 'Address is required'
        if (!formData.city.trim()) return 'City is required'
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
      await updateEvent(selectedEvent!.id, {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        address: formData.address,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        coverImageUrl: formData.coverImageUrl,
        capacity: formData.capacity || 0,
        pricePerPerson: formData.pricePerPerson || 0,
        tags: formData.tags,
        isRecurring: formData.isRecurring,
        recurrencePattern: formData.recurrencePattern,
      })

      Alert.alert('Success', 'Event updated!', [
        {
          text: 'View Event',
          onPress: () => router.push(`/events/${selectedEvent!.id}`),
        },
      ])
    } catch (err: any) {
      console.error('Failed to update event:', err)
      Alert.alert('Error', err.message || 'Failed to update event')
    } finally {
      setSubmitting(false)
    }
  }

  const isOwner = user && selectedEvent && selectedEvent.businessId === user.id

  if (loading || loadingCategories) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  if (!isOwner || !selectedEvent) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>You don't have permission to edit this event</Text>
            <Button title="Go Back" onPress={() => router.back()} />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Event</Text>
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
              title={formData.title}
              description={formData.description}
              categoryIds={formData.categoryIds}
              categories={categories}
              onTitleChange={(text) => setFormData({ ...formData, title: text })}
              onDescriptionChange={(text) => setFormData({ ...formData, description: text })}
              onCategoryChange={(categoryIds) => setFormData({ ...formData, categoryIds })}
              isLoading={submitting}
            />
          )}

          {currentStep === 1 && (
            <EventWizardStep2
              startDateTime={formData.startDateTime}
              endDateTime={formData.endDateTime}
              isRecurring={formData.isRecurring}
              recurrencePattern={formData.recurrencePattern}
              onStartDateChange={(date) => setFormData({ ...formData, startDateTime: date.toISOString() })}
              onEndDateChange={(date) => setFormData({ ...formData, endDateTime: date.toISOString() })}
              onRecurringToggle={(recurring) => setFormData({ ...formData, isRecurring: recurring })}
              onRecurrencePatternChange={(pattern) => setFormData({ ...formData, recurrencePattern: pattern })}
              isLoading={submitting}
            />
          )}

          {currentStep === 2 && (
            <EventWizardStep3
              address={formData.address}
              city={formData.city}
              latitude={formData.latitude}
              longitude={formData.longitude}
              onAddressChange={(text) => setFormData({ ...formData, address: text })}
              onCityChange={(text) => setFormData({ ...formData, city: text })}
              onLatitudeChange={(value) => setFormData({ ...formData, latitude: value })}
              onLongitudeChange={(value) => setFormData({ ...formData, longitude: value })}
              isLoading={submitting}
            />
          )}

          {currentStep === 3 && (
            <EventWizardStep4
              coverImageUrl={formData.coverImageUrl}
              tags={formData.tags}
              capacity={formData.capacity}
              pricePerPerson={formData.pricePerPerson}
              onCoverImageChange={(uri) => setFormData({ ...formData, coverImageUrl: uri })}
              onTagsChange={(tags) => setFormData({ ...formData, tags })}
              onCapacityChange={(value) => setFormData({ ...formData, capacity: value })}
              onPriceChange={(value) => setFormData({ ...formData, pricePerPerson: value })}
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
              title={submitting ? 'Updating...' : 'Save Changes'}
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing.lg,
    },
    errorText: {
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
      marginVertical: Spacing.lg,
      textAlign: 'center',
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
