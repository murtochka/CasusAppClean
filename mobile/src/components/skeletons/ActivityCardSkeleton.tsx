import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { Colors, Spacing } from '@/constants';

/**
 * ActivityCardSkeleton - Placeholder for ActivityCard component
 * Used in search results, calendar, and favorites lists
 */
export const ActivityCardSkeleton: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Image placeholder */}
      <Skeleton width="100%" height={140} borderRadius={Spacing.radius.md} />

      {/* Content section */}
      <View style={styles.content}>
        {/* Title */}
        <Skeleton width="80%" height={18} borderRadius={4} style={styles.title} />

        {/* Category + City row*/}
        <View style={styles.metaRow}>
          <Skeleton width="35%" height={14} borderRadius={3} />
          <Skeleton width="40%" height={14} borderRadius={3} />
        </View>

        {/* Rating + Price row */}
        <View style={styles.metaRow}>
          <Skeleton width="25%" height={16} borderRadius={3} />
          <Skeleton width="30%" height={16} borderRadius={3} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
    overflow: 'hidden',
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
});
