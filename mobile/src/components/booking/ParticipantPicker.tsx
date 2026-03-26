import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '@/constants';

interface ParticipantPickerProps {
  participants: number;
  minParticipants?: number;
  maxParticipants: number;
  onParticipantChange: (count: number) => void;
  disabled?: boolean;
}

export const ParticipantPicker: React.FC<ParticipantPickerProps> = ({
  participants,
  minParticipants = 1,
  maxParticipants,
  onParticipantChange,
  disabled = false,
}) => {
  const canDecrease = participants > minParticipants && !disabled;
  const canIncrease = participants < maxParticipants && !disabled;

  return (
    <View style={styles.container}>
      <View style={styles.pickerRow}>
        <TouchableOpacity
          style={[styles.button, !canDecrease && styles.buttonDisabled]}
          onPress={() => canDecrease && onParticipantChange(participants - 1)}
          disabled={!canDecrease}
          activeOpacity={canDecrease ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !canDecrease && styles.buttonTextDisabled]}>−</Text>
        </TouchableOpacity>

        <View style={styles.countContainer}>
          <Text style={styles.countLabel}>Participants</Text>
          <Text style={styles.countValue}>{participants}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !canIncrease && styles.buttonDisabled]}
          onPress={() => canIncrease && onParticipantChange(participants + 1)}
          disabled={!canIncrease}
          activeOpacity={canIncrease ? 0.7 : 1}
        >
          <Text style={[styles.buttonText, !canIncrease && styles.buttonTextDisabled]}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          {maxParticipants - participants === 0
            ? 'Maximum reached'
            : `Up to ${maxParticipants - participants} more participant${maxParticipants - participants !== 1 ? 's' : ''}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.light.surfaceSecondary,
    opacity: 0.5,
  },
  buttonText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 32,
    color: '#ffffff',
  },
  buttonTextDisabled: {
    color: Colors.light.textSecondary,
  },
  countContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  countLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  countValue: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 48,
    color: Colors.primary,
  },
  infoContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
  },
});
