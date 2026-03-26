import { useState } from 'react';
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  ScrollView,
  Text,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '@/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_HEIGHT = 280;

interface ImageCarouselProps {
  images?: string[];
}

export default function ImageCarousel({ images = [] }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  // Default placeholder if no images
  if (!images || images.length === 0) {
    return (
      <View style={[styles.placeholderContainer, { backgroundColor: theme.surfaceSecondary }]}>
        <Ionicons name="images-outline" size={64} color={theme.textTertiary} />
      </View>
    );
  }

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index ? styles.dotActive : styles.dotInactive
              ]}
            />
          ))}
        </View>
      )}

      {/* Image Counter Badge */}
      {images.length > 0 && (
        <View style={styles.counterBadge}>
          <Ionicons name="images-outline" size={14} color="white" />
          <View style={styles.divider} />
          <Text style={styles.counterText}>
            {currentIndex + 1}/{images.length}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  placeholderContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: Spacing.radius.xs,  // Small dots (4px radius)
  },
  dotActive: {
    width: 8,
    height: 8,
    backgroundColor: 'white',
  },
  dotInactive: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  counterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  divider: {
    backgroundColor: 'white',
    width: 1,
    height: 12,
  },
  counterText: {
    color: 'white',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
  },
});
