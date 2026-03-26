import React, { useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Text,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '@/constants';

export interface PhotoGalleryCarouselProps {
  photos: string[];
  maxVisiblePhotos?: number;
}

export function PhotoGalleryCarousel({
  photos,
  maxVisiblePhotos = 3,
}: PhotoGalleryCarouselProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;
  const { width } = useWindowDimensions();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return null;
  }

  const displayPhotos = photos.slice(0, maxVisiblePhotos);
  const photoWidth = width - Spacing.xl * 2 - Spacing.md * 2; // Account for padding and container
  const photoHeight = 200;

  return (
    <View style={styles.container}>
      {/* Photo Count Badge */}
      <View style={styles.photoBadge}>
        <Ionicons name="image-outline" size={14} color={Colors.primary} />
        <Text style={styles.photoBadgeText}>
          {photos.length} photo{photos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Photo Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {displayPhotos.map((photoUri, index) => (
          <TouchableOpacity
            key={`${photoUri}-${index}`}
            activeOpacity={0.9}
            style={[
              styles.photoContainer,
              {
                width: photoWidth,
                height: photoHeight,
                marginRight: index < displayPhotos.length - 1 ? Spacing.md : 0,
              },
            ]}
          >
            <Image
              source={{ uri: photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
            
            {/* Photo Index Indicator */}
            <View style={[styles.indexBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
              <Text style={styles.indexText}>
                {index + 1}/{displayPhotos.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {displayPhotos.length > 1 && (
        <View style={styles.dotsContainer}>
          {displayPhotos.map((_, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === selectedPhotoIndex ? Colors.primary : theme.border,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  photoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(13, 76, 60, 0.1)',
    borderRadius: Spacing.radius.sm,
    alignSelf: 'flex-start',
  },
  photoBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary,
  },
  carousel: {
    flex: 0,
  },
  photoContainer: {
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photo: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  indexBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.radius.sm,
  },
  indexText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: '#fff',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
