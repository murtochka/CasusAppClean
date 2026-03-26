import { View, Pressable, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

export function StarRating({
  rating,
  onRatingChange,
  size = 28,
  readonly = false,
}: StarRatingProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  const handleStarPress = (index: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      const isFilled = i < rating;
      
      stars.push(
        <Pressable
          key={i}
          onPress={() => handleStarPress(i)}
          disabled={readonly}
          style={({ pressed }) => [
            styles.starButton,
            !readonly && pressed && styles.starPressed,
          ]}
        >
          <Ionicons
            name={isFilled ? 'star' : 'star-outline'}
            size={size}
            color={isFilled ? Colors.star : theme.textTertiary}
          />
        </Pressable>
      );
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {renderStars()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  starPressed: {
    opacity: 0.7,
  },
});
