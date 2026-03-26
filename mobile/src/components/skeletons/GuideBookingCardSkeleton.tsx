import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../common/Skeleton';
import { Colors, Spacing } from '@/constants';

/**
 * GuideBookingCardSkeleton - Placeholder for booking cards in guide bookings list
 * Shows activity title, user info, date/time, participants, and status
 */
export const GuideBookingCardSkeleton: React.FC = () => {
  return (
    <View style={[styles.container, { backgroundColor: Colors.surface, borderColor: Colors.neutral[200] }]}>
      {/* Activity Title */}
      <Skeleton width="75%" height={18} borderRadius={3} style={styles.mb} />

      {/* User Name */}
      <Skeleton width="50%" height={14} borderRadius={3} style={styles.mb} />

      {/* Date and Time Row */}
      <View style={styles.row}>
        <Skeleton width="45%" height={14} borderRadius={3} />
        <Skeleton width="40%" height={14} borderRadius={3} />
      </View>

      {/* Participants and Status Row */}
      <View style={[styles.row, styles.mt]}>
        <Skeleton width="35%" height={14} borderRadius={3} />
        <Skeleton width={80} height={24} borderRadius={4} />
      </View>

      {/* Action Buttons Row */}
      <View style={[styles.buttonRow, styles.mt]}>
        <Skeleton width={95} height={32} borderRadius={Spacing.radius.sm} />
        <Skeleton width={95} height={32} borderRadius={Spacing.radius.sm} />
        <Skeleton width={95} height={32} borderRadius={Spacing.radius.sm} />
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
    justifyContent: 'flex-end',
  },
});
