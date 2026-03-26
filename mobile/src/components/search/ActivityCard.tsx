import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing, Typography } from '@/constants'
import { Badge } from '../common'
import { ActivityWithGuide } from '@/types/search'
import { formatPrice, formatDuration } from '@/utils/formatters'

const { width } = Dimensions.get('window')

type ActivityCardVariant = 'featured' | 'compact' | 'list'

interface ActivityCardProps {
  activity: ActivityWithGuide
  onPress: (id: string) => void
  variant?: ActivityCardVariant
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onPress,
  variant = 'list',
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  // Get gradient colors based on category
  const gradientColors =
    Colors.categories[activity.categoryId as keyof typeof Colors.categories] ||
    Colors.categories['All']

  // Get difficulty color
  const difficultyColor = Colors.difficulties[activity.difficulty as keyof typeof Colors.difficulties] || Colors.accent

  const categoryLabel = activity.categoryId
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  // Render star rating
  const renderStars = (rating: number = 0, size: number = 12) => {
    const stars = []
    const fullStars = Math.floor(rating)

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`full-${i}`} name="star" size={size} color={Colors.star} />
      )
    }

    for (let i = fullStars; i < 5; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color={Colors.transparent.white65} />
      )
    }

    return <View style={styles.starsRow}>{stars}</View>
  }

  if (variant === 'featured') {
    return (
      <Pressable
        onPress={() => onPress(activity.id)}
        style={({ pressed }) => [
          styles.featured,
          pressed && styles.pressedFeatured,
        ]}
      >
        <LinearGradient
          colors={[gradientColors[0], gradientColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredBadgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{categoryLabel}</Text>
            </View>
          </View>

          <View style={styles.featuredBottom}>
            <Badge
              label={activity.difficulty}
              color={difficultyColor}
              backgroundColor={difficultyColor + '33'}
              dot
              size="sm"
            />
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {activity.title}
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.transparent.white75} />
                <Text style={styles.locationText}>
                  {activity.city}, {activity.country}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={Colors.star} />
                <Text style={styles.ratingText}>
                  {(activity.rating || 0).toFixed(1)}
                </Text>
              </View>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.featuredPrice}>{formatPrice(activity.price)}</Text>
              <Text style={styles.featuredPricePer}> / person</Text>
              <View style={styles.durationChip}>
                <Ionicons name="time-outline" size={11} color={Colors.transparent.white80} />
                <Text style={styles.durationText}>
                  {formatDuration(activity.durationMinutes)}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    )
  }

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={() => onPress(activity.id)}
        style={({ pressed }) => [
          styles.compact,
          pressed && styles.pressedCompact,
        ]}
      >
        <LinearGradient
          colors={[gradientColors[0], gradientColors[1]]}
          style={styles.compactThumb}
        >
          <Badge
            label={activity.difficulty}
            color={difficultyColor}
            backgroundColor={difficultyColor + '33'}
            dot
            size="sm"
            style={styles.compactDifficultyBadge}
          />
        </LinearGradient>
        <View style={[styles.compactInfo, { backgroundColor: theme.card }]}>
          <Text style={[styles.compactTitle, { color: theme.text }]} numberOfLines={2}>
            {activity.title}
          </Text>
          <View style={styles.compactLocationRow}>
            <Ionicons name="location-outline" size={11} color={theme.textSecondary} />
            <Text style={[styles.compactLocation, { color: theme.textSecondary }]}>
              {activity.city}
            </Text>
          </View>
          <View style={styles.compactBottom}>
            <View style={styles.compactRatingRow}>
              <Ionicons name="star" size={11} color={Colors.star} />
              <Text style={[styles.compactRating, { color: theme.textSecondary }]}>
                {(activity.rating || 0).toFixed(1)}
              </Text>
            </View>
            <Text style={[styles.compactPrice, { color: Colors.primary }]}>
              {formatPrice(activity.price)}
            </Text>
          </View>
        </View>
      </Pressable>
    )
  }

  // Default: list variant
  return (
    <Pressable
      onPress={() => onPress(activity.id)}
      style={({ pressed }) => [
        styles.listCard,
        { backgroundColor: theme.card, borderColor: theme.border },
        pressed && styles.pressedList,
      ]}
    >
      <LinearGradient
        colors={[gradientColors[0], gradientColors[1]]}
        style={styles.listThumb}
      >
        <Ionicons name="compass" size={26} color={Colors.transparent.white65} />
      </LinearGradient>
      <View style={styles.listInfo}>
        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={2}>
          {activity.title}
        </Text>
        <View style={styles.listLocationRow}>
          <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
          <Text style={[styles.listLocation, { color: theme.textSecondary }]}>
            {activity.city}, {activity.country}
          </Text>
        </View>
        <View style={styles.listBottom}>
          {renderStars(activity.rating || 0)}
          <Text style={[styles.listReviewCount, { color: theme.textTertiary }]}>
            ({activity.reviewCount || 0})
          </Text>
          <View style={styles.listPriceContainer}>
            <Text style={[styles.listPrice, { color: Colors.primary }]}>
              {formatPrice(activity.price)}
            </Text>
            <Text style={[styles.listPricePer, { color: theme.textTertiary }]}>/pp</Text>
          </View>
        </View>
      </View>
      <View style={styles.listRight}>
        <Badge
          label={activity.difficulty}
          color={difficultyColor}
          backgroundColor={difficultyColor + '22'}
          size="sm"
        />
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  // Featured variant
  featured: {
    width: width * 0.78,
    height: 280,
    borderRadius: Spacing.radius['3xl'],
    overflow: 'hidden',
    marginRight: Spacing.md,
    ...Spacing.shadow.xl,
  },
  pressedFeatured: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  featuredGradient: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  featuredBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.transparent.white20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius['3xl'],
    borderWidth: 1,
    borderColor: Colors.transparent.white30,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    letterSpacing: 0.3,
  },
  featuredBottom: {
    gap: Spacing.sm,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    lineHeight: 26,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    color: Colors.transparent.white75,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: '#fff',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  featuredPrice: {
    color: '#fff',
    fontSize: Typography.fontSize['5xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  featuredPricePer: {
    color: Colors.transparent.white65,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.xs,
  },
  durationChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginLeft: 'auto',
    backgroundColor: Colors.transparent.white15,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.md,
  },
  durationText: {
    color: Colors.transparent.white80,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
  },

  // Compact variant
  compact: {
    width: 185,
    borderRadius: Spacing.radius['2xl'],
    overflow: 'hidden',
    marginRight: Spacing.md,
    ...Spacing.shadow.lg,
  },
  pressedCompact: {
    opacity: 0.93,
    transform: [{ scale: 0.97 }],
  },
  compactThumb: {
    width: '100%',
    height: 130,
    padding: Spacing.md,
  },
  compactDifficultyBadge: {
    alignSelf: 'flex-start',
    marginTop: 'auto',
  },
  compactInfo: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  compactTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    lineHeight: 19,
  },
  compactLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactLocation: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  compactBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  compactRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  compactRating: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
  compactPrice: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },

  // List variant
  listCard: {
    flexDirection: 'row',
    borderRadius: Spacing.radius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 12,
    ...Spacing.shadow.md,
  },
  pressedList: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  listThumb: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  listTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    lineHeight: 19,
  },
  listLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  listLocation: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  listBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  listReviewCount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  listPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: 'auto',
  },
  listPrice: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  listPricePer: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    marginLeft: 2,
  },
  listRight: {
    padding: Spacing.md,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
})
