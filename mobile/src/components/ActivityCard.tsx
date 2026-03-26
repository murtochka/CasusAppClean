import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors, Spacing } from '@/constants'

export interface ActivityCardProps {
  id: string
  title?: string
  name?: string
  city?: string
  category?: string
  description?: string
  price?: number
  rating?: number
  imageUrl?: string
  image?: string
  difficulty?: 'easy' | 'medium' | 'hard' | string
  onPress?: () => void
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  name,
  city,
  category,
  description,
  price,
  rating,
  imageUrl,
  image,
  onPress,
}) => {
  const imageSource = imageUrl || image
  const displayTitle = title || name || 'Activity'

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      {imageSource ? (
        <Image source={{ uri: imageSource }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={24} color={Colors.neutral[400]} />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>

        {(city || category) && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {[city, category].filter(Boolean).join(' • ')}
          </Text>
        )}

        {!!description && (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>{typeof price === 'number' ? `$${price}` : 'Price N/A'}</Text>
          {typeof rating === 'number' && (
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={14} color={Colors.accentShades[500]} />
              <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default ActivityCard

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.radius.lg,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  image: {
    width: '100%',
    height: 170,
    backgroundColor: Colors.neutral[100],
  },
  imagePlaceholder: {
    width: '100%',
    height: 170,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    color: Colors.neutral[900],
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: Colors.neutral[600],
    fontSize: 12,
  },
  description: {
    color: Colors.neutral[700],
    fontSize: 13,
  },
  footer: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    color: Colors.primaryShades[600],
    fontSize: 16,
    fontWeight: '700',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: Colors.neutral[700],
    fontSize: 12,
    fontWeight: '600',
  },
})
