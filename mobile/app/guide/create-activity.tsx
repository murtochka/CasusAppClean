import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, ActivityIndicator, useColorScheme, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ActivityBasicInfoForm } from '@/components/guide/ActivityBasicInfoForm'
import { ActivityDetailsForm } from '@/components/guide/ActivityDetailsForm'
import { ActivityAvailabilityForm } from '@/components/guide/ActivityAvailabilityForm'
import { CreateActivityFormData } from '@/types/guide'
import { useGuideStore } from '@/store/guideStore'

export default function CreateActivityScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const { createActivity } = useGuideStore()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [formData, setFormData] = useState<Partial<CreateActivityFormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCancel = () => {
    router.back()
  }

  const handleNext = (stepData: Partial<CreateActivityFormData>) => {
    setFormData((prev) => ({ ...prev, ...stepData }))
    if (step === 3) {
      setStep(4)
    } else if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4)
    }
  }

  const handleSubmit = async (stepData: Partial<CreateActivityFormData>) => {
    try {
      setIsSubmitting(true)
      const finalData = { ...formData, ...stepData }

      // Prepare the data for the API
      const activityPayload = {
        title: finalData.title,
        description: finalData.description,
        categoryId: finalData.categoryId,
        price: finalData.price,
        maxParticipants: finalData.maxParticipants,
        durationMinutes: finalData.durationMinutes,
        difficulty: finalData.difficulty,
        meetingPoint: finalData.meetingPoint,
        city: finalData.city,
        country: finalData.country,
      }

      await createActivity(activityPayload)

      // If availability data was provided, add it
      if (
        finalData.availabilityDate &&
        finalData.startTime &&
        finalData.endTime &&
        finalData.availableSpots
      ) {
        // This will be handled by the store action or a separate call
        // For now, the activity is created with the initial availability in the store
      }

      Alert.alert('Success', 'Activity created successfully!')

      router.back()
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ErrorBoundary level="route">
      <View style={[{ flex: 1, backgroundColor: isDark ? Colors.dark.background : Colors.light.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {isSubmitting ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : step === 1 ? (
        <ActivityBasicInfoForm
          initialData={formData}
          onNext={handleNext}
        />
      ) : step === 2 ? (
        <ActivityDetailsForm
          initialData={formData}
          onNext={handleNext}
          onBack={handleBack}
          onCancel={handleCancel}
        />
      ) : step === 3 ? (
        // Step 3: Photos (placeholder for now, will be implemented later)
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityAvailabilityForm
            initialData={formData}
            onSubmit={handleSubmit}
            onBack={handleBack}
            onCancel={handleCancel}
          />
        </View>
      ) : (
        <ActivityAvailabilityForm
          initialData={formData}
          onSubmit={handleSubmit}
          onBack={handleBack}
          onCancel={handleCancel}
        />
      )}
    </View>
    </ErrorBoundary>
  )
}
