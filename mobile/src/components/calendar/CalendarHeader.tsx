import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

export type CalendarViewMode = 'month' | 'week' | 'day';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  selectedDate: Date;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  selectedDate,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'month' && styles.viewButtonActive]}
          onPress={() => onViewModeChange('month')}
        >
          <Text
            style={[styles.viewButtonText, viewMode === 'month' && styles.viewButtonTextActive]}
          >
            Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'week' && styles.viewButtonActive]}
          onPress={() => onViewModeChange('week')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'week' && styles.viewButtonTextActive]}>
            Week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, viewMode === 'day' && styles.viewButtonActive]}
          onPress={() => onViewModeChange('day')}
        >
          <Text style={[styles.viewButtonText, viewMode === 'day' && styles.viewButtonTextActive]}>
            Day
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.background,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: Typography.fontSize['4xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 4,
  },
  viewButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonActive: {
    backgroundColor: Colors.primary,
  },
  viewButtonText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.light.textSecondary,
  },
  viewButtonTextActive: {
    color: Colors.light.background,
  },
});
