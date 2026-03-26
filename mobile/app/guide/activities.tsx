import { useEffect, useState } from 'react'
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text as RNText,
  Alert,
  useColorScheme,
  TouchableOpacity,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Colors, Spacing, Typography } from '@/constants'
import { Button } from '@/components/common'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ActivityCardSkeleton } from '@/components/skeletons'
import { useGuideStore } from '@/store/guideStore'
import { GuideActivityCard } from '@/components/guide/GuideActivityCard'
import { useAuth } from '@/hooks/useAuth'

export default function GuideActivitiesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const isDark = useColorScheme() === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const { user } = useAuth()
  const { activities, loading, error, loadActivities, deleteActivity, clearError } = useGuideStore()
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadActivities({ isActive: filter === 'all' ? undefined : filter === 'active' })
  }, [filter])

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadActivities({ isActive: filter === 'all' ? undefined : filter === 'active' })
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = (activityId: string, title: string) => {
    Alert.alert(
      'Delete Activity',
      `Are you sure you want to delete "${title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteActivity(activityId)
              Alert.alert('Success', 'Activity deleted successfully')
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete activity')
            }
          },
          style: 'destructive',
        },
      ]
    )
  }

  const filteredActivities =
    filter === 'all' ? activities : activities.filter((a) => a.isActive === (filter === 'active'))

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
    },
    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: insets.top + Spacing.lg,
      paddingBottom: Spacing.md,
      gap: Spacing.md,
    },
    title: {
      fontSize: Typography.fontSize.xl,
      fontWeight: '700',
      color: isDark ? Colors.dark.text : Colors.light.text,
    },
    filterRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'center',
    },
    filterButton: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.primary,
    },
    filterButtonActive: {
      backgroundColor: Colors.primary,
    },
    filterButtonText: {
      fontSize: Typography.fontSize.sm,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.xl,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: Spacing.xl,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: Spacing.lg,
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
      padding: Spacing.md,
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
    errorButton: {
      marginTop: Spacing.sm,
    },
  })

  if (!user || user.role !== 'guide') {
    return (
      <ErrorBoundary level="route">
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <RNText style={{ color: theme.textSecondary }}>This section is for guides only</RNText>
        </View>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <RNText style={styles.title}>My Activities</RNText>

        {/* Filter Buttons */}
        <View style={styles.filterRow}>
          {(['all', 'active', 'inactive'] as const).map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              onPress={() => setFilter(filterOption)}
              style={[
                styles.filterButton,
                filter === filterOption && styles.filterButtonActive,
              ]}
            >
              <RNText style={[
                styles.filterButtonText,
                { color: filter === filterOption ? Colors.light.text : Colors.primary },
              ]}>
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </RNText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <RNText style={styles.errorText}>{error}</RNText>
            <Button
              variant="outline"
              onPress={clearError}
              style={styles.errorButton}
            >
              Dismiss
            </Button>
          </View>
        )}

        {/* Loading State */}
        {loading.activities ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
              <ActivityCardSkeleton key={i} />
            ))}
          </View>
        ) : filteredActivities.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <RNText style={styles.emptyTitle}>
              {filter === 'all' ? 'No activities yet' : `No ${filter} activities`}
            </RNText>
            <RNText style={styles.emptySubtitle}>
              {filter === 'all'
                ? 'Create your first activity to get started'
                : `You don't have any ${filter} activities`}
            </RNText>
            {filter === 'all' && (
              <Button
                onPress={() => router.push('/guide/create-activity')}
              >
                Create First Activity
              </Button>
            )}
          </View>
        ) : (
          /* Activities List */
          filteredActivities.map((activity) => (
            <GuideActivityCard
              key={activity.id}
              activity={activity}
              onPress={() => router.push(`/guide/${activity.id}/edit`)}
              onEdit={() => router.push(`/guide/${activity.id}/edit`)}
              onDelete={() => handleDelete(activity.id, activity.title)}
              onManageAvailability={() =>
                router.push(`/guide/availability/${activity.id}`)
              }
            />
          ))
        )}
      </ScrollView>
    </View>
    </ErrorBoundary>
  )
}
