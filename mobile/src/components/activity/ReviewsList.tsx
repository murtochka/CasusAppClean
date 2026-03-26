import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Pressable, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { reviewService } from '@/services/reviewService';
import { ReviewWithUser } from '@/types/review';
import { Colors, Typography, Spacing } from '@/constants';
import { Card } from '../common';
import { PhotoGalleryCarousel } from '../review/PhotoGalleryCarousel';
import { logger } from '@/utils/logger';

interface ReviewsListProps {
  activityId: string;
  guideRating?: number;
}

export default function ReviewsList({ activityId, guideRating }: ReviewsListProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [activityId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reviewService.getReviews(activityId, 10, 0);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotalReviews(data.total);
      logger.info('Reviews loaded', { activityId, count: data.reviews.length });
    } catch (err: any) {
      const message = err.message || 'Failed to load reviews';
      setError(message);
      logger.error('Failed to load reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={16}
          color="#FBBF24"
        />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading reviews...
          </Text>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <View style={styles.container}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Reviews & Ratings
          </Text>
          <Text style={[styles.errorText, { color: Colors.error }]}>
            {error}
          </Text>
        </View>
      </Card>
    );
  }

  const displayRating = averageRating || guideRating || 0;

  return (
    <Card>
      <View style={styles.container}>
        {/* Header with Stats */}
        <View style={styles.headerSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Reviews & Ratings
          </Text>

          {totalReviews > 0 && (
            <View style={styles.statsRow}>
              <View style={styles.ratingColumn}>
                <Text style={[styles.ratingNumber, { color: theme.text }]}>
                  {displayRating.toFixed(1)}
                </Text>
                {renderStars(Math.round(displayRating))}
              </View>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View>
                <Text style={[styles.reviewCount, { color: theme.text }]}>
                  {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Reviews List */}
        {totalReviews === 0 ? (
          <View style={styles.noReviewsContainer}>
            <Ionicons name="chatbubble-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.noReviewsText, { color: theme.textSecondary }]}>
              No reviews yet
            </Text>
            <Text style={[styles.noReviewsSubtext, { color: theme.textTertiary }]}>
              Be the first to review this activity!
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.slice(0, 3).map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: theme.surfaceSecondary }]}
              >
                <View style={styles.reviewRow}>
                  {/* Avatar */}
                  <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                    {review.user.avatarUrl ? (
                      <Image source={{ uri: review.user.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <Text style={styles.avatarText}>
                        {review.user.fullName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.reviewContent}>
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.reviewerName, { color: theme.text }]}>
                        {review.user.fullName}
                      </Text>
                      <Text style={[styles.reviewDate, { color: theme.textTertiary }]}>
                        {formatDate(review.createdAt)}
                      </Text>
                    </View>

                    {renderStars(review.rating)}

                    {review.comment && (
                      <Text
                        style={[styles.reviewComment, { color: theme.textSecondary }]}
                        numberOfLines={3}
                      >
                        {review.comment}
                      </Text>
                    )}

                    {/* Photo Gallery */}
                    {review.photoUrls && review.photoUrls.length > 0 && (
                      <View style={styles.photoSection}>
                        <PhotoGalleryCarousel photos={review.photoUrls} />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* View All Button */}
            {totalReviews > 3 && (
              <Pressable
                onPress={() => router.push(`/activity/${activityId}/reviews` as any)}
                style={({ pressed }) => [
                  styles.viewAllButton,
                  pressed && styles.viewAllButtonPressed,
                ]}
              >
                <Text style={styles.viewAllText}>
                  View all {totalReviews} reviews
                </Text>
                <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  headerSection: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  loadingText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingColumn: {
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewCount: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  divider: {
    width: 1,
    height: 40,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  noReviewsText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  noReviewsSubtext: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  reviewsList: {
    gap: 12,
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  reviewContent: {
    flex: 1,
    gap: 4,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
  reviewDate: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
  },
  reviewComment: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 18,
    marginTop: 4,
  },
  photoSection: {
    marginTop: Spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 4,
  },
  viewAllButtonPressed: {
    opacity: 0.6,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
  },
});
