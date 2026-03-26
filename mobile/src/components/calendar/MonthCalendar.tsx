import React, { useMemo } from 'react';
import {
  Box,
  Text,
  Pressable,
  HStack,
  VStack,
  Icon,
} from 'native-base';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/colors';

interface MonthCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  currentMonth: Date;
  activitiesByDate?: Record<string, number>;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  selectedDate,
  onDateSelect,
  onMonthChange,
  currentMonth,
  activitiesByDate = {},
}) => {
  const daysInMonth = useMemo(() => {
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      return eachDayOfInterval({ start, end });
    } catch (error) {
      console.warn('Error calculating days in month:', error);
      return [];
    }
  }, [currentMonth]);

  const monthYear = format(currentMonth, 'MMMM yyyy');

  const handlePrevMonth = () => {
    try {
      onMonthChange(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
      );
    } catch (error) {
      console.warn('Error changing to previous month:', error);
    }
  };

  const handleNextMonth = () => {
    try {
      onMonthChange(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
      );
    } catch (error) {
      console.warn('Error changing to next month:', error);
    }
  };

  if (daysInMonth.length === 0) {
    return (
      <Box bg={Colors.surface} rounded={BorderRadius.md} p={Spacing.sm} shadow="sm">
        <Text color={Colors.neutral[600]}>Error loading calendar</Text>
      </Box>
    );
  }

  return (
    <VStack
      bg={Colors.surface}
      rounded={BorderRadius.md}
      p={Spacing.sm}
      space={Spacing.xs}
      shadow="sm"
    >
      {/* Header with Navigation */}
      <HStack justifyContent="space-between" alignItems="center" mb={Spacing.xs}>
        <Pressable
          onPress={handlePrevMonth}
          p={Spacing.xs}
          rounded={BorderRadius.md}
          _pressed={{ bg: Colors.neutral[100] }}
        >
          <Icon
            as={MaterialCommunityIcons}
            name="chevron-left"
            size="md"
            color={Colors.primaryShades[600]}
          />
        </Pressable>

        <Text
          fontSize="md"
          fontWeight="600"
          color={Colors.neutral[900]}
          flex={1}
          textAlign="center"
        >
          {monthYear}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          p={Spacing.xs}
          rounded={BorderRadius.md}
          _pressed={{ bg: Colors.neutral[100] }}
        >
          <Icon
            as={MaterialCommunityIcons}
            name="chevron-right"
            size="md"
            color={Colors.primaryShades[600]}
          />
        </Pressable>
      </HStack>

      {/* Day Labels */}
      <HStack justifyContent="space-around">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Box key={`${day}-${index}`} w="14%">
            <Text
              fontSize="2xs"
              fontWeight="600"
              color={Colors.neutral[500]}
              textAlign="center"
            >
              {day}
            </Text>
          </Box>
        ))}
      </HStack>

      {/* Calendar Grid */}
      <VStack space={Spacing.xs}>
        {Array.from({
          length: Math.ceil(daysInMonth.length / 7),
        }).map((_, weekIndex) => (
          <HStack key={`week-${weekIndex}`} justifyContent="space-around">
            {daysInMonth
              .slice(weekIndex * 7, (weekIndex + 1) * 7)
              .map((day) => {
                const dayStr = format(day, 'yyyy-MM-dd');
                const activityCount = activitiesByDate[dayStr] || 0;
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                const isSameMonthDay = isSameMonth(day, currentMonth);

                return (
                  <Pressable
                    key={dayStr}
                    onPress={() => {
                      try {
                        onDateSelect(day);
                      } catch (error) {
                        console.warn('Error selecting date:', error);
                      }
                    }}
                    w="14%"
                  >
                    {({ isPressed }) => (
                      <Box
                        h={28}
                        rounded={BorderRadius.sm}
                        bg={
                          isSelected
                            ? Colors.primaryShades[600]
                            : isTodayDate
                            ? Colors.primaryShades[50]
                            : 'transparent'
                        }
                        justifyContent="center"
                        alignItems="center"
                        position="relative"
                        style={{
                          opacity: isPressed ? 0.9 : !isSameMonthDay ? 0.3 : 1,
                          transform: isPressed
                            ? [{ scale: 0.95 }]
                            : [{ scale: 1 }],
                        }}
                        borderWidth={isTodayDate && !isSelected ? 1 : 0}
                        borderColor={Colors.primaryShades[300]}
                      >
                        <Text
                          fontSize="xs"
                          fontWeight="500"
                          color={
                            isSelected
                              ? Colors.surface
                              : Colors.neutral[900]
                          }
                        >
                          {format(day, 'd')}
                        </Text>

                        {/* Activity Count Indicator */}
                        {activityCount > 0 && (
                          <Box
                            position="absolute"
                            bottom={1}
                            h={1}
                            w={1}
                            rounded="full"
                            bg={isSelected ? Colors.surface : Colors.accentShades[500]}
                          />
                        )}
                      </Box>
                    )}
                  </Pressable>
                );
              })}
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};
