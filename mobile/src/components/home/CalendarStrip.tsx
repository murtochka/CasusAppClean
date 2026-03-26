import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { Colors, Spacing } from '@/constants';
import { BorderRadius } from '@/constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = 60;
const DAYS_TO_SHOW = 14;

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? Colors.dark : Colors.light;
  const scrollViewRef = useRef<ScrollView>(null);
  const today = startOfDay(new Date());

  // Generate dates array (7 days before today, today, and 6 days after)
  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    return addDays(today, i - 7);
  });

  // Auto-scroll to today on mount
  useEffect(() => {
    const todayIndex = dates.findIndex((date) => isSameDay(date, today));
    if (todayIndex !== -1 && scrollViewRef.current) {
      const scrollToX = Math.max(0, todayIndex * DAY_WIDTH - SCREEN_WIDTH / 2 + DAY_WIDTH / 2);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollToX, animated: true });
      }, 100);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={DAY_WIDTH}
        snapToAlignment="center"
      >
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
          <TouchableOpacity
            key={date.toISOString()}
            style={[
              styles.dayContainer,
              { backgroundColor: theme.surface },
              isSelected && styles.dayContainerSelected,
              isToday && !isSelected && [styles.dayContainerToday, { borderColor: Colors.primary }],
            ]}
            onPress={() => onDateSelect(date)}
            activeOpacity={0.7}
          >
            <Text
            style={[
              styles.weekday,
              { color: theme.textSecondary },
              isSelected && styles.weekdaySelected,
              isToday && !isSelected && styles.weekdayToday,
            ]}
            >
              {format(date, 'EEE')}
            </Text>
            <Text
            style={[
              styles.day,
              { color: theme.text },
              isSelected && styles.daySelected,
              isToday && !isSelected && styles.dayToday,
            ]}
            >
              {format(date, 'd')}
            </Text>
            {isToday && !isSelected && <View style={styles.todayDot} />}
          </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: Spacing.md,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.xs / 2,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.surface,
  },
  dayContainerSelected: {
    backgroundColor: Colors.primary,
  },
  dayContainerToday: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  weekday: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs / 2,
    textTransform: 'uppercase',
  },
  weekdaySelected: {
    color: Colors.light.card,
  },
  weekdayToday: {
    color: Colors.primary,
    fontWeight: '600',
  },
  day: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  daySelected: {
    color: Colors.light.card,
    fontWeight: '700',
  },
  dayToday: {
    color: Colors.primary,
    fontWeight: '700',
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: Spacing.xs / 2,
  },
});
