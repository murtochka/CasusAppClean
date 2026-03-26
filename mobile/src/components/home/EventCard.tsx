import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants';
import { BorderRadius } from '@/constants/colors';
import type { ActivityWithGuide, Difficulty } from '@/types/search';

interface EventCardProps {
  activity: ActivityWithGuide;
  onPress: () => void;
  horizontal?: boolean;
}

const getDifficultyColor = (difficulty: Difficulty): string => {
  switch (difficulty) {
    case 'easy':
      return '#10B981'; // green
    case 'medium':
      return '#F59E0B'; // amber
    case 'hard':
      return '#EF4444'; // red
    default:
      return Colors.light.textSecondary;
  }
};

const getDifficultyLabel = (difficulty: Difficulty): string => {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export const EventCard: React.FC<EventCardProps> = ({ activity, onPress, horizontal = false }) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  const activityWithImage = activity as ActivityWithGuide & { imageUrl?: string };
  const imageUrl = activityWithImage.imageUrl || 'https://via.placeholder.com/400x250';
  const guideName = activity.guide?.user?.fullName || 'Unknown Guide';
  const guideAvatar = activity.guide?.user?.avatarUrl;
  const rating = activity.rating || activity.guide?.rating || 0;

  const cardStyle = horizontal ? [
    styles.card,
    styles.cardHorizontal,
    { backgroundColor: theme.card }
  ] : [styles.card, { backgroundColor: theme.card }];

  return (
    <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.9}>
      {/* Large Background Image with Gradient Overlay */}
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.gradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {activity.title}
          </Text>
        </LinearGradient>
      </ImageBackground>

      {/* Details Section */}
      <View style={styles.details}>
        {/* Price and Difficulty Row */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>€{activity.price}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(activity.difficulty) },
            ]}
          >
            <Text style={styles.difficultyText}>
              {getDifficultyLabel(activity.difficulty)}
            </Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.textSecondary}
          />
          <Text style={[styles.location, { color: theme.textSecondary }]} numberOfLines={1}>
            {activity.city}
          </Text>
        </View>

        {/* Guide Section */}
        <View style={[styles.guideSection, { borderTopColor: theme.border }]}>
          {guideAvatar ? (
            <Image source={{ uri: guideAvatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: theme.surface }]}>
              <Ionicons
                name="person"
                size={20}
                color={theme.textSecondary}
              />
            </View>
          )}
          <View style={styles.guideInfo}>
            <Text style={[styles.guideName, { color: theme.text }]} numberOfLines={1}>
              {guideName}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#FDB022" />
              <Text style={[styles.rating, { color: theme.textSecondary }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHorizontal: {
    width: Dimensions.get('window').width * 0.85,
    marginHorizontal: 0,
    marginRight: Spacing.lg,
  },
  imageBackground: {
    width: '100%',
    height: 220,
  },
  image: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.card,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  details: {
    padding: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.card,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  location: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs / 2,
  },
  guideSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.light.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs / 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs / 2,
  },
});
