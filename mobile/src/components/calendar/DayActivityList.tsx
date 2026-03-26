import React from 'react';
import { VStack, FlatList, Box, Text } from 'native-base';
import { ActivityCard } from '@/components/ActivityCard';
import { Colors, Spacing, BorderRadius } from '@/constants/colors';
import { Activity } from '@/types/search';

interface DayActivityListProps {
  date: Date;
  activities: Activity[];
}

export const DayActivityList: React.FC<DayActivityListProps> = ({
  date,
  activities,
}) => {
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const renderActivityCard = ({ item }: { item: Activity }) => (
    <ActivityCard
      id={item.id}
      title={item.title}
      city={item.city}
      category={item.category}
      price={item.price}
      rating={item.rating}
      imageUrl={item.imageUrl}
      difficulty={item.difficulty}
      onPress={() => {
        // Navigate to activity detail
        // This would be handled by navigation context
      }}
    />
  );

  if (activities.length === 0) {
    return (
      <Box
        bg={Colors.neutral[50]}
        rounded={BorderRadius.lg}
        p={Spacing.xl}
        align="center"
      >
        <Text color={Colors.neutral[600]} fontSize="md" fontWeight="600">
          No activities available
        </Text>
      </Box>
    );
  }

  return (
    <VStack space={Spacing.lg}>
      <Box>
        <Text
          fontSize="sm"
          fontWeight="600"
          color={Colors.neutral[600]}
          mb={Spacing.md}
        >
          {dateStr}
        </Text>
        <Text fontSize="xs" color={Colors.neutral[500]}>
          {activities.length} activity{activities.length !== 1 ? 'ies' : ''}
        </Text>
      </Box>

      <FlatList
        data={activities}
        renderItem={renderActivityCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <Box h={Spacing.lg} />}
      />
    </VStack>
  );
};
