import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Typography } from '@/constants';
import { Button, Card, StarRating, ErrorBoundary } from '@/components/common';
import { PhotoPicker } from '@/components/review/PhotoPicker';
import { reviewService } from '@/services/reviewService';
import { bookingService } from '@/services/bookingService';
import { fileUploadService } from '@/services/fileUploadService';
import { useBookingStore } from '@/store/bookingStore';
import { logger } from '@/utils/logger';

const MAX_COMMENT_LENGTH = 500;

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId: string }>();
  const bookingId = typeof params.bookingId === 'string' ? params.bookingId : '';

  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const { getUserReview, setUserReview, clearUserReview } = useBookingStore();
  const existingReview = getUserReview(bookingId);
  const isEditMode = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating || 5);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [photos, setPhotos] = useState<string[]>(existingReview?.photoUrls || []);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      setIsLoadingBooking(true);
      const booking = await bookingService.getBookingById(bookingId);
      setBookingDetails(booking);
    } catch (error: any) {
      logger.error('Failed to load booking details', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setIsLoadingBooking(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload new photos (non-Cloudinary URLs are local files)
      let photoUrls = photos;
      const localPhotos = photos.filter(uri => !uri.includes('cloudinary'));
      
      if (localPhotos.length > 0) {
        setIsUploadingPhotos(true);
        try {
          const uploadedPhotos = await fileUploadService.uploadMultipleImages(
            localPhotos,
            (progress) => setUploadProgress(progress)
          );
          
          // Replace local URIs with Cloudinary URLs
          photoUrls = photos.map(uri => {
            const uploaded = uploadedPhotos.find(p => p.url && localPhotos.includes(uri));
            return uploaded?.url || uri;
          });
          
          logger.info('Photos uploaded successfully', { count: uploadedPhotos.length });
        } finally {
          setIsUploadingPhotos(false);
          setUploadProgress({});
        }
      }

      let review;
      if (isEditMode && existingReview) {
        // Update existing review
        review = await reviewService.updateReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
          photos: photoUrls.length > 0 ? photoUrls : undefined,
        });
        logger.info('Review updated successfully', { reviewId: existingReview.id, rating });
      } else {
        // Create new review
        review = await reviewService.createReview({
          bookingId,
          rating,
          comment: comment.trim() || undefined,
          photos: photoUrls.length > 0 ? photoUrls : undefined,
        });
        logger.info('Review submitted successfully', { bookingId, rating, photoCount: photoUrls.length });
      }

      // Update store
      setUserReview(bookingId, review);

      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        isEditMode ? 'Review Updated!' : 'Review Submitted!',
        'Thank you for sharing your experience.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      logger.error('Failed to submit review', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Submission Failed',
        error.message || 'Unable to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
      setIsUploadingPhotos(false);
      setUploadProgress({});
    }
  };

  const handleDelete = () => {
    if (!isEditMode || !existingReview) return;

    Alert.alert(
      'Delete Review?',
      'This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await reviewService.deleteReview(existingReview.id);
              clearUserReview(bookingId);
              
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              logger.info('Review deleted successfully', { reviewId: existingReview.id });

              Alert.alert(
                'Review Deleted',
                'Your review has been removed.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.back(),
                  },
                ]
              );
            } catch (error: any) {
              logger.error('Failed to delete review', error);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                'Delete Failed',
                error.message || 'Unable to delete review. Please try again.'
              );
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleRatingChange = (newRating: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRating(newRating);
  };

  const handleCancel = () => {
    if (rating !== 5 || comment.trim() || photos.length > 0) {
      Alert.alert(
        'Discard Review?',
        'Your review will not be saved.',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoadingBooking) {
    return (
      <ErrorBoundary level="route">
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading booking details...
            </Text>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary level="route">
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              {isEditMode ? 'Edit Review' : 'Write a Review'}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isEditMode ? 'Update your experience' : 'Share your experience with others'}
            </Text>
          </View>

          {/* Booking Summary */}
          {bookingDetails && (
            <Card style={styles.bookingSummary}>
              <Text style={[styles.activityTitle, { color: theme.text }]}>
                {bookingDetails.activityTitle || 'Your Activity'}
              </Text>
              <Text style={[styles.bookingDate, { color: theme.textSecondary }]}>
                Booking #{bookingId.substring(0, 8).toUpperCase()}
              </Text>
            </Card>
          )}

          {/* Rating Section */}
          <Card style={styles.ratingCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              How was your experience? *
            </Text>
            <View style={styles.ratingContainer}>
              <StarRating
                rating={rating}
                onRatingChange={handleRatingChange}
                size={40}
                readonly={false}
              />
            </View>
            <Text style={[styles.ratingLabel, { color: theme.textTertiary }]}>
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </Text>
          </Card>

          {/* Comment Section */}
          <Card style={styles.commentCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Share your thoughts (optional)
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  color: theme.text,
                  backgroundColor: theme.surfaceSecondary,
                  borderColor: theme.border,
                },
              ]}
              placeholder="What did you like? What could be improved?"
              placeholderTextColor={theme.textTertiary}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={MAX_COMMENT_LENGTH}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: theme.textTertiary }]}>
              {comment.length}/{MAX_COMMENT_LENGTH}
            </Text>
          </Card>

          {/* Photo Section */}
          <Card style={styles.photoCard}>
            <PhotoPicker
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={3}
              uploading={isUploadingPhotos}
              uploadProgress={uploadProgress}
            />
          </Card>

          {/* Tips */}
          <Card style={[styles.tipsCard, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.tipsTitle, { color: theme.textSecondary }]}>
              💡 Tips for helpful reviews:
            </Text>
            <Text style={[styles.tipItem, { color: theme.textTertiary }]}>
              • Be specific about what you enjoyed
            </Text>
            <Text style={[styles.tipItem, { color: theme.textTertiary }]}>
              • Mention the guide's expertise
            </Text>
            <Text style={[styles.tipItem, { color: theme.textTertiary }]}>
              • Share unique aspects of the experience
            </Text>
          </Card>
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onPress={handleDelete}
                disabled={isDeleting || isSubmitting}
                loading={isDeleting}
                style={[styles.deleteButton, { borderColor: Colors.error }]}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={isSubmitting || isDeleting || isUploadingPhotos || rating === 0}
                loading={isSubmitting || isUploadingPhotos}
                style={styles.submitButton}
              >
                {isUploadingPhotos ? 'Uploading photos...' : isSubmitting ? 'Updating...' : 'Update Review'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onPress={handleCancel}
                disabled={isSubmitting}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={isSubmitting || isUploadingPhotos || rating === 0}
                loading={isSubmitting || isUploadingPhotos}
                style={styles.submitButton}
              >
                {isUploadingPhotos ? 'Uploading photos...' : isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing['4xl'],
    gap: Spacing.lg,
  },
  header: {
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['5xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  bookingSummary: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  activityTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  bookingDate: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
  },
  ratingCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  ratingLabel: {
    textAlign: 'center',
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.medium,
  },
  commentCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  commentInput: {
    minHeight: 120,
    padding: Spacing.md,
    borderRadius: Spacing.radius.lg,
    borderWidth: 1,
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.regular,
  },
  charCount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'right',
  },
  photoCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  tipsCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: Spacing.xs,
  },
  tipItem: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
