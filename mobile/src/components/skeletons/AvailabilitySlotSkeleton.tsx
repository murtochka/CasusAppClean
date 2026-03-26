import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { Colors, Spacing } from '@/constants';

/**
 * AvailabilitySlotSkeleton - Placeholder for availability slot cards in guide availability manager
 * Shows date, time range, available spots, and action buttons
 */
export const AvailabilitySlotSkeleton: React.FC = () => {
  return (
    <View style={[styles.container, { backgroundColor: Colors.surface, borderLeftColor: Colors.primaryShades[500] }]}> 
      <View style={styles.content}>
        {/* Date */}
        <Skeleton width="45%" height={14} borderRadius={3} style={styles.mb} />

        {/* Time Row */}
        <View style={[styles.row, styles.mb]}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width="50%" height={16} borderRadius={3} style={styles.ml} />
        </View>

        {/* Spots Row */}
        <View style={styles.row}>
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width="35%" height={14} borderRadius={3} style={styles.ml} />
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Skeleton width={40} height={40} borderRadius={8} style={styles.actionBtn} />
        <Skeleton width={40} height={40} borderRadius={8} style={styles.actionBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 3,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mb: {
    marginBottom: Spacing.xs,
  },
  ml: {
    marginLeft: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionBtn: {
    // No additional styles needed, set in Skeleton component
  },
});
