import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'
import { Button } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AvailabilitySlotSkeleton } from '@/components/skeletons'
import { AvailabilitySlotCard } from '@/components/guide/AvailabilitySlotCard'
import { QuickAddAvailabilityForm } from '@/components/guide/QuickAddAvailabilityForm'
import { useAuth } from '@/hooks/useAuth'
import { ActivityAvailability } from '@/types/booking'
import { Activity } from '@/types/search'
import { apiClient } from '@/services/api'

export default function AvailabilityManagerScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const { user } = useAuth()
  const { activityId } = useLocalSearchParams<{ activityId: string }>()

  const [activity, setActivity] = useState<Activity | null>(null)
  const [slots, setSlots] = useState<ActivityAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [activityId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch activity details
      const activityRes = await apiClient.get(`/activities/${activityId}`) as { data: Activity }
      setActivity(activityRes.data)

      // Fetch availability slots
      const slotsRes = await apiClient.get(`/availability/${activityId}`) as { data: ActivityAvailability[] }
      setSlots(slotsRes.data || [])
    } catch (err: any) {
      console.error('Failed to load availability:', err)
      setError(err.message || 'Failed to load availability data')
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const handleAddSlot = async (
    date: string,
    startTime: string,
    endTime: string,
    availableSpots: number
  ) => {
    try {
      const payload = {
        activityId,
        date,
        startTime,
        endTime,
        availableSpots,
      }
      
      const response = await apiClient.post('/availability', payload) as { data: ActivityAvailability }
      
      // Add new slot to list
      setSlots((prev) => [...prev, response.data].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ))
      
      setShowAddForm(false)
      Alert.alert('Success', 'Availability slot added successfully')
    } catch (error: any) {
      throw error
    }
  }

  const handleEditSlot = (_slot: ActivityAvailability) => {
    Alert.alert('Edit Slot', 'Edit functionality will be available soon!')
    // TODO: Implement edit modal
  }

  const handleDeleteSlot = (slot: ActivityAvailability) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/availability/${slot.id}`)
              setSlots((prev) => prev.filter((s) => s.id !== slot.id))
              Alert.alert('Success', 'Slot deleted successfully')
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete slot')
            }
          },
        },
      ]
    )
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: insets.top + Spacing.lg,
      paddingBottom: Spacing.md,
      backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? Colors.dark.border : Colors.light.border,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    backText: {
      fontSize: Typography.fontSize.base,
      color: Colors.primary,
      marginLeft: Spacing.xs,
      fontWeight: '500',
    },
    activityTitle: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.xs,
    },
    activityMeta: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    section: {
      marginBottom: Spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    sectionTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    slotCount: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      fontWeight: '500',
    },
    emptyState: {
      padding: Spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyIcon: {
      marginBottom: Spacing.md,
    },
    emptyTitle: {
      fontSize: Typography.fontSize.lg,
      fontWeight: '600',
      color: isDark ? Colors.dark.text : Colors.light.text,
      marginBottom: Spacing.sm,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: Typography.fontSize.sm,
      color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    skeletonContainer: {
      flex: 1,
      padding: Spacing.lg,
    },
    errorContainer: {
      backgroundColor: Colors.error + '20',
      borderRadius: 8,
      padding: Spacing.md,
      marginBottom: Spacing.md,
    },
    errorText: {
      color: Colors.error,
      fontSize: Typography.fontSize.sm,
      marginBottom: Spacing.sm,
    },
    addButton: {
      marginBottom: Spacing.lg,
    },
  })

  if (!user || user.role !== 'guide') {
    return (
      <ErrorBoundary level="route">
        <View style={[styles.container, styles.loadingContainer]}>
          <Text style={{ color: theme.textSecondary }}>This section is for guides only</Text>
        </View>
      </ErrorBoundary>
    )
  }

  if (loading) {
    return (
      <ErrorBoundary level="route">
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.skeletonContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <AvailabilitySlotSkeleton key={i} />
            ))}
          </View>
        </View>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {activity && (
          <>
            <Text style={styles.activityTitle}>{activity.title}</Text>
            <Text style={styles.activityMeta}>
              {activity.city} • Max {activity.maxParticipants} participants
            </Text>
          </>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button variant="outline" onPress={loadData} style={styles.addButton}>
              Retry
            </Button>
          </View>
        )}

        {/* Quick Add Form */}
        {showAddForm && (
          <QuickAddAvailabilityForm
            activityId={activityId!}
            onAdd={handleAddSlot}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {/* Add Button */}
        {!showAddForm && (
          <Button
            icon="add-circle-outline"
            onPress={() => setShowAddForm(true)}
            style={styles.addButton}
          >
            Add Availability Slot
          </Button>
        )}

        {/* Slots List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Availability Slots</Text>
            <Text style={styles.slotCount}>{slots.length} slot{slots.length !== 1 ? 's' : ''}</Text>
          </View>

          {slots.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="calendar-outline"
                size={64}
                color={Colors.primary}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>No availability slots yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first availability slot to allow tourists to book this activity
              </Text>
            </View>
          ) : (
            slots.map((slot) => (
              <AvailabilitySlotCard
                key={slot.id}
                slot={slot}
                onEdit={() => handleEditSlot(slot)}
                onDelete={() => handleDeleteSlot(slot)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
    </ErrorBoundary>
  )
}
