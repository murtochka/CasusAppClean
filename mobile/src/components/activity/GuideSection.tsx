import { Pressable, StyleSheet, Text, View, Image, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants';
import { Card } from '../common';

interface Guide {
  id: string;
  businessName?: string;
  fullName?: string;
  avatarUrl?: string;
  rating?: number;
  totalReviews?: number;
  description?: string;
  sustainabilityCertified?: boolean;
}

interface GuideSectionProps {
  guide?: Guide;
}

export default function GuideSection({ guide }: GuideSectionProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  if (!guide) {
    return null;
  }

  const displayName = guide.businessName || guide.fullName || 'Unknown Guide';
  const rating = guide.rating || 0;
  const reviewCount = guide.totalReviews || 0;

  const handleViewProfile = () => {
    Alert.alert('Coming Soon', 'Guide profile screen will be added soon.');
  };

  return (
    <Card>
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Guide
        </Text>

        <Pressable
          onPress={handleViewProfile}
          style={({ pressed }) => [
            styles.guideCard,
            pressed && styles.guideCardPressed,
          ]}
        >
          <View style={styles.guideRow}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
              {guide.avatarUrl ? (
                <Image source={{ uri: guide.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            {/* Guide Info */}
            <View style={styles.guideInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.guideName, { color: theme.text }]}>
                  {displayName}
                </Text>
                {guide.sustainabilityCertified && (
                  <Ionicons 
                    name="leaf" 
                    size={16} 
                    color={Colors.success} 
                  />
                )}
              </View>

              {/* Rating */}
              {rating > 0 && (
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FBBF24" />
                  <Text style={[styles.ratingText, { color: theme.text }]}>
                    {rating.toFixed(1)}
                  </Text>
                  {reviewCount > 0 && (
                    <Text style={[styles.reviewCount, { color: theme.textSecondary }]}>
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </Text>
                  )}
                </View>
              )}

              {/* Description Preview */}
              {guide.description && (
                <Text 
                  style={[styles.guideDescription, { color: theme.textSecondary }]}
                  numberOfLines={2}
                >
                  {guide.description}
                </Text>
              )}
            </View>

            {/* View Profile Arrow */}
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={theme.textTertiary} 
            />
          </View>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  guideCard: {
    padding: Spacing.sm,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  guideCardPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.98 }],
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  guideInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guideName: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  reviewCount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  guideDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
    marginTop: 2,
  },
});
