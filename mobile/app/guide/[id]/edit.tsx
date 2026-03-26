import { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Button } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Colors, Spacing, Typography } from '@/constants'
import { useGuideStore } from '@/store/guideStore'
import type { Difficulty } from '@/types/guide'

export default function EditActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  const { activities, loadActivities, updateActivity, loading } = useGuideStore()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [meetingPoint, setMeetingPoint] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [isActive, setIsActive] = useState(true)
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const activity = useMemo(
    () => activities.find((item) => item.id === id),
    [activities, id]
  )

  useEffect(() => {
    const ensureData = async () => {
      if (!activities.length) {
        await loadActivities({ page: 1, limit: 100 })
      }
    }

    ensureData()
  }, [])

  useEffect(() => {
    if (!activity || hydrated) return

    setTitle(activity.title)
    setDescription(activity.description)
    setPrice(String(activity.price))
    setMaxParticipants(String(activity.maxParticipants))
    setDurationMinutes(String(activity.durationMinutes))
    setMeetingPoint(activity.meetingPoint)
    setCity(activity.city)
    setCountry(activity.country)
    setDifficulty(activity.difficulty)
    setIsActive(activity.isActive)
    setCategoryId(activity.categoryId)
    setHydrated(true)
  }, [activity, hydrated])

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    Number(price) > 0 &&
    Number(maxParticipants) > 0 &&
    Number(durationMinutes) > 0 &&
    meetingPoint.trim().length > 0 &&
    city.trim().length > 0 &&
    country.trim().length > 0

  const handleSave = async () => {
    if (!id || !isValid) return

    try {
      setSubmitting(true)
      await updateActivity(id, {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        difficulty,
        price: Number(price),
        maxParticipants: Number(maxParticipants),
        durationMinutes: Number(durationMinutes),
        meetingPoint: meetingPoint.trim(),
        city: city.trim(),
        country: country.trim(),
        isActive,
      })

      Alert.alert('Success', 'Activity updated successfully')
      router.back()
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to update activity')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading.activities && !hydrated) {
    return (
      <ErrorBoundary level="route">
        <View style={[styles.center, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ErrorBoundary>
    )
  }

  if (!activity && !loading.activities) {
    return (
      <ErrorBoundary level="route">
        <View style={[styles.center, { backgroundColor: theme.background, paddingHorizontal: Spacing.lg }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Activity not found</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>The selected activity could not be loaded.</Text>
          <Button onPress={() => router.back()} style={{ marginTop: Spacing.md }}>
            Go Back
          </Button>
        </View>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { paddingTop: insets.top + Spacing.md }]}> 
        <Text style={[styles.title, { color: theme.text }]}>Edit Activity</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Update your activity details</Text>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Activity title"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Describe the activity"
            placeholderTextColor={theme.placeholder}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>Price</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>Max Participants</Text>
            <TextInput
              value={maxParticipants}
              onChangeText={setMaxParticipants}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              placeholder="10"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>Duration (minutes)</Text>
            <TextInput
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              keyboardType="number-pad"
              placeholder="120"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
            <View style={styles.chipRow}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((value) => {
                const active = difficulty === value
                return (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setDifficulty(value)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? Colors.primary : theme.surface,
                        borderColor: active ? Colors.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? '#fff' : theme.textSecondary }]}> 
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Meeting Point</Text>
          <TextInput
            value={meetingPoint}
            onChangeText={setMeetingPoint}
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="Meeting point"
            placeholderTextColor={theme.placeholder}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>City</Text>
            <TextInput
              value={city}
              onChangeText={setCity}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="City"
              placeholderTextColor={theme.placeholder}
            />
          </View>
          <View style={[styles.field, styles.half]}>
            <Text style={[styles.label, { color: theme.text }]}>Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="Country"
              placeholderTextColor={theme.placeholder}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.text }]}>Status</Text>
          <View style={styles.chipRow}>
            <TouchableOpacity
              onPress={() => setIsActive(true)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? Colors.success : theme.surface,
                  borderColor: isActive ? Colors.success : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: isActive ? '#fff' : theme.textSecondary }]}>Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsActive(false)}
              style={[
                styles.chip,
                {
                  backgroundColor: !isActive ? Colors.error : theme.surface,
                  borderColor: !isActive ? Colors.error : theme.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: !isActive ? '#fff' : theme.textSecondary }]}>Inactive</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <Button variant="outline" onPress={() => router.back()}>
            Cancel
          </Button>
          <Button onPress={handleSave} disabled={!isValid} loading={submitting || loading.updating}>
            Save Changes
          </Button>
        </View>
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    fontSize: Typography.fontSize.sm,
  },
  field: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  half: {
    flex: 1,
  },
  chipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  actions: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  emptyText: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
})
