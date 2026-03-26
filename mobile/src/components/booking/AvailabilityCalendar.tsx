import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isBefore, startOfDay } from 'date-fns';
import { Colors, Spacing, Typography } from '@/constants';
import { ActivityAvailability } from '@/types/booking';

interface AvailabilityCalendarProps {
  activityId: string;
  slots: ActivityAvailability[];
  isLoading: boolean;
  onSlotSelect: (slot: ActivityAvailability) => void;
  maxDate?: Date;
  minDate?: Date;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  activityId: _activityId,
  slots,
  isLoading,
  onSlotSelect,
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  minDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slotsForDate, setSlotsForDate] = useState<ActivityAvailability[]>([]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, ActivityAvailability[]>();
    slots.forEach((slot) => {
      const dateKey = format(new Date(slot.date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(slot);
    });
    return map;
  }, [slots]);

  const handleDateSelect = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateKey);
    setSlotsForDate(slotsByDate.get(dateKey) || []);
  };

  const handleSlotSelect = (slot: ActivityAvailability) => {
    onSlotSelect(slot);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendarDay = (date: Date, index: number) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const hasSlots = slotsByDate.has(dateKey);
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isSelected = selectedDate === dateKey;
    const isPast = isBefore(date, startOfDay(minDate));
    const isFuture = isBefore(maxDate, date);
    const isDisabled = isPast || isFuture || !hasSlots;

    return (
      <TouchableOpacity
        key={`${dateKey}-${index}`}
        style={[
          styles.dayCell,
          isSelected && styles.daySelected,
          !isCurrentMonth && styles.dayOtherMonth,
          isDisabled && styles.dayDisabled,
        ]}
        onPress={() => !isDisabled && handleDateSelect(date)}
        disabled={isDisabled}
        activeOpacity={isDisabled ? 1 : 0.7}
      >
        <Text
          style={[
            styles.dayText,
            !isCurrentMonth && styles.dayOtherMonthText,
            isDisabled && styles.dayDisabledText,
            isSelected && styles.daySelectedText,
          ]}
        >
          {format(date, 'd')}
        </Text>
        {hasSlots && !isDisabled && (
          <View style={[styles.dotIndicator, isSelected && styles.dotSelected]} />
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading available dates...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <TouchableOpacity
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          style={styles.monthNavButton}
        >
          <Text style={styles.monthNavText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.monthTitle}>
          {format(currentMonth, 'MMMM yyyy')}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          style={styles.monthNavButton}
        >
          <Text style={styles.monthNavText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* Day Headers */}
      <View style={styles.dayHeaderRow}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.dayHeaderCell}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((date, index) => renderCalendarDay(date, index))}
      </View>

      {/* Time Slots for Selected Date */}
      {selectedDate && (
        <View style={styles.slotsSection}>
          <Text style={styles.slotsTitle}>Available Times</Text>
          {slotsForDate.length === 0 ? (
            <Text style={styles.noSlotsText}>No available times for this date</Text>
          ) : (
            <FlatList
              data={slotsForDate}
              scrollEnabled={false}
              keyExtractor={(slot) => slot.id}
              renderItem={({ item: slot }) => (
                <TouchableOpacity
                  style={[
                    styles.slotCard,
                    {
                      opacity: slot.availableSpots > 0 ? 1 : 0.5,
                    },
                  ]}
                  onPress={() => handleSlotSelect(slot)}
                  disabled={slot.availableSpots <= 0}
                  activeOpacity={0.7}
                >
                  <View style={styles.slotTime}>
                    <Text style={styles.slotTimeText}>
                      {slot.startTime} - {slot.endTime}
                    </Text>
                  </View>
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotSpots}>
                      {slot.availableSpots} spot{slot.availableSpots !== 1 ? 's' : ''} available
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    marginTop: Spacing.md,
    color: Colors.light.text,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  monthTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.light.text,
  },
  monthNavButton: {
    padding: Spacing.sm,
    borderRadius: 8,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  monthNavText: {
    fontSize: Typography.fontSize['3xl'],
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  dayHeaderText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
    position: 'relative',
  },
  daySelected: {
    backgroundColor: Colors.primary,
  },
  dayOtherMonth: {
    backgroundColor: Colors.light.surfaceSecondary,
  },
  dayDisabled: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.text,
  },
  daySelectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  dayOtherMonthText: {
    color: Colors.light.textSecondary,
  },
  dayDisabledText: {
    color: Colors.light.textSecondary,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    position: 'absolute',
    bottom: 4,
  },
  dotSelected: {
    backgroundColor: '#ffffff',
  },
  slotsSection: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  slotsTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  noSlotsText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotTime: {
    flex: 1,
  },
  slotTimeText: {
    fontSize: Typography.fontSize.md,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.light.text,
  },
  slotInfo: {
    alignItems: 'flex-end',
  },
  slotSpots: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.light.textSecondary,
  },
});
