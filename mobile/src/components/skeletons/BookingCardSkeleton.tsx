import React from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { Colors, Spacing } from '@/constants';

/**
 * BookingCardSkeleton - Placeholder for booking card in bookings list
 */
export const BookingCardSkeleton: React.FC = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = isDark ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          {/* Activity ID */}
          <Skeleton width="70%" height={16} borderRadius={3} style={styles.mb} />

          {/* Participant count */}
          <Skeleton width="55%" height={14} borderRadius={3} />
        </View>

        {/* Status badge */}
        <Skeleton width={70} height={24} borderRadius={4} />
      </View>

      <View style={[styles.row, styles.mt]}>
        {/* Price */}
        <Skeleton width="30%" height={20} borderRadius={3} />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Skeleton width={90} height={32} borderRadius={Spacing.radius.sm} />
          <Skeleton width={90} height={32} borderRadius={Spacing.radius.sm} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: Spacing.radius.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt: {
    marginTop: Spacing.sm,
  },
  mb: {
    marginBottom: Spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
