import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { Colors, Spacing } from '@/constants';

/**
 * ActivityDetailSkeleton - Placeholder for activity detail page
 * Covers image carousel, guide section, reviews
 */
export const ActivityDetailSkeleton: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View>
      {/* Image carousel */}
      <Skeleton width="100%" height={250} style={styles.image} />

      {/* Title section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Skeleton width="85%" height={24} borderRadius={4} style={styles.mb} />
        <View style={styles.row}>
          <Skeleton width="40%" height={14} borderRadius={3} />
          <Skeleton width="35%" height={14} borderRadius={3} />
        </View>
      </View>

      {/* Guide section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Skeleton width="30%" height={18} borderRadius={3} style={styles.mb} />
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <Skeleton width={60} height={60} borderRadius={30} />
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={16} borderRadius={3} style={styles.mb} />
            <Skeleton width="45%" height={14} borderRadius={3} />
          </View>
        </View>
      </View>

      {/* Reviews section */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Skeleton width="30%" height={18} borderRadius={3} style={styles.mb} />
        {[1, 2].map((i) => (
          <View key={i} style={styles.reviewSkeleton}>
            <Skeleton width="50%" height={14} borderRadius={3} style={styles.mb} />
            <Skeleton width="100%" height={40} borderRadius={3} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    marginBottom: Spacing.md,
  },
  section: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Spacing.radius.md,
  },
  mb: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  reviewSkeleton: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#00000010',
  },
});
