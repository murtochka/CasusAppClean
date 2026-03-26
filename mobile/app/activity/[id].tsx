import { useEffect, useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useActivityStore } from '@/store/activityStore'
import { useFavoriteStore } from '@/store/favoriteStore'
import { formatPrice, formatDuration, formatDifficulty } from '@/utils/formatters'
import { logger } from '@/utils/logger'
import { Badge, Card, ErrorBoundary } from '@/components/common'
import { ActivityDetailSkeleton } from '@/components/skeletons'
import ImageCarousel from '@/components/activity/ImageCarousel'
import GuideSection from '@/components/activity/GuideSection'
import ReviewsList from '@/components/activity/ReviewsList'
import { Colors, Typography } from '@/constants'

export default function ActivityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  
  const { currentActivity: activity, isLoading, error, fetchActivity } = useActivityStore()
  const { isFavorited, addFavorite, removeFavorite } = useFavoriteStore()
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  useEffect(() => {
    if (id) {
      fetchActivity(id)
    }
  }, [id])

  const handleToggleFavorite = async () => {
    if (!activity || isTogglingFavorite) return
    
    setIsTogglingFavorite(true)
    try {
      if (isFavorited(activity.id)) {
        await removeFavorite(activity.id)
        logger.info('Removed from favorites', { activityId: activity.id })
      } else {
        await addFavorite(activity.id)
        logger.info('Added to favorites', { activityId: activity.id })
      }
    } catch (error: any) {
      logger.error('Failed to toggle favorite', error)
    } finally {
      setIsTogglingFavorite(false)
    }
  }

  const handleBookNow = () => {
    if (!activity) return
    router.push(`/booking/${activity.id}` as any)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return Colors.success
      case 'medium':
        return Colors.warning
      case 'hard':
        return Colors.error
      default:
        return theme.textSecondary
    }
  }

  if (isLoading) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ActivityDetailSkeleton />
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  if (error || !activity) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={[styles.center, { backgroundColor: theme.background, paddingHorizontal: 20 }]}> 
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: theme.text }]}>Error Loading Activity</Text>
            <Text style={[styles.errorDesc, { color: theme.textSecondary }]}>{error || 'Activity not found'}</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.goBack}>← Go Back</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <View style={[styles.container, { backgroundColor: theme.background }]}> 
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}> 
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => [
                styles.backBtn, 
                pressed && styles.pressed
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={Colors.primary} />
            </Pressable>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Activity Details</Text>
            <Pressable
              onPress={handleToggleFavorite}
              disabled={isTogglingFavorite}
              style={({ pressed }) => [
                styles.favoriteBtn,
                pressed && styles.pressed
              ]}
            >
              <Ionicons
                name={activity && isFavorited(activity.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={activity && isFavorited(activity.id) ? Colors.error : theme.textSecondary}
              />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Image Carousel */}
            <ImageCarousel images={(activity as any)?.images} />

            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: theme.text }]}>{activity.title}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={18} color={theme.textSecondary} />
                <Text style={[styles.locationText, { color: theme.textSecondary }]}>{activity.city}, {activity.country}</Text>
              </View>
            </View>

            <Card>
              <View style={styles.infoRow}>
                <View style={styles.infoCol}>
                  <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>PRICE</Text>
                  <Text style={styles.price}>{formatPrice(activity.price)}</Text>
                  <Text style={[styles.infoSub, { color: theme.textTertiary }]}>per person</Text>
                </View>
                <View style={[styles.infoCol, styles.infoCenter]}>
                  <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>DURATION</Text>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.durationText, { color: theme.text }]}>{formatDuration(activity.durationMinutes)}</Text>
                  </View>
                </View>
                <View style={[styles.infoCol, styles.infoRight]}>
                  <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>DIFFICULTY</Text>
                  <Badge label={formatDifficulty(activity.difficulty)} color={getDifficultyColor(activity.difficulty)} backgroundColor={getDifficultyColor(activity.difficulty) + '22'} />
                </View>
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
              <Text style={[styles.sectionText, { color: theme.textSecondary }]}>{activity.description}</Text>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Meeting Point</Text>
              <View style={styles.row}>
                <Ionicons name="pin-outline" size={20} color={Colors.primary} />
                <Text style={[styles.sectionText, { color: theme.textSecondary, flex: 1 }]}>{activity.meetingPoint}</Text>
              </View>
              <View style={[styles.mapPlaceholder, { backgroundColor: theme.surfaceSecondary }]}>
                <Ionicons name="map-outline" size={40} color={theme.textTertiary} />
                <Text style={[styles.mapPlaceholderText, { color: theme.textTertiary }]}>Map</Text>
              </View>
            </Card>

            <Card style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Group Size</Text>
              <View style={styles.row}>
                <Ionicons name="people-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>Maximum {activity.maxParticipants} participants</Text>
              </View>
            </Card>

            {/* Guide Section */}
            <GuideSection guide={(activity as any)?.guide} />

            {/* Reviews Section */}
            <ReviewsList activityId={activity.id} guideRating={(activity as any)?.guide?.rating} />
          </ScrollView>

          {/* Fixed Bottom Bar - Book Now Button */}
          <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
            <Pressable
              onPress={handleBookNow}
              style={({ pressed }) => [
                styles.bookButton,
                pressed && styles.bookButtonPressed
              ]}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
              <Text style={styles.bookButtonPrice}>• {formatPrice(activity.price)}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerText: { marginTop: 10, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.regular },
  errorTitle: { marginTop: 10, fontSize: Typography.fontSize['3xl'], fontFamily: Typography.fontFamily.bold },
  errorDesc: { marginTop: 6, textAlign: 'center', fontSize: Typography.fontSize.md, fontFamily: Typography.fontFamily.regular },
  goBack: { marginTop: 14, color: Colors.primary, fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.medium },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  favoriteBtn: { padding: 4 },
  pressed: { opacity: 0.6, transform: [{ scale: 0.95 }] },
  headerTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.bold, flex: 1, marginLeft: 8 },
  scrollContent: { paddingBottom: 100 },
  titleBlock: { marginBottom: 2, paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: Typography.fontSize['5xl'], fontFamily: Typography.fontFamily.bold },
  locationRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.regular },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  infoCenter: { alignItems: 'center' },
  infoRight: { alignItems: 'flex-end' },
  infoLabel: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.medium },
  price: { marginTop: 4, color: Colors.primary, fontSize: Typography.fontSize['4xl'], fontFamily: Typography.fontFamily.bold },
  infoSub: { fontSize: Typography.fontSize.sm, fontFamily: Typography.fontFamily.regular },
  durationRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.semibold },
  sectionCard: { marginTop: 2 },
  sectionTitle: { fontSize: Typography.fontSize['2xl'], fontFamily: Typography.fontFamily.bold, marginBottom: 6 },
  sectionText: { fontSize: Typography.fontSize.lg, fontFamily: Typography.fontFamily.regular, lineHeight: 22 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mapPlaceholder: {
    marginTop: 12,
    height: 140,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bookButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  bookButtonText: {
    color: 'white',
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  bookButtonPrice: {
    color: 'white',
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.semibold,
  },
})
