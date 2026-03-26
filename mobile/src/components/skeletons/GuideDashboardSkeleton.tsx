import React from 'react';
import { Box, Skeleton, VStack, HStack } from 'native-base';
import { Colors, Spacing, BorderRadius } from '@/constants/colors';

export const GuideDashboardSkeleton: React.FC = () => {
  return (
    <VStack space={Spacing.lg} p={Spacing.lg} bg={Colors.background}>
      {/* Header Skeleton */}
      <Box>
        <Skeleton
          h={32}
          rounded={BorderRadius.lg}
          startColor={Colors.neutral[200]}
          endColor={Colors.neutral[100]}
          mb={Spacing.md}
        />
      </Box>

      {/* Stats Cards Skeleton */}
      <VStack space={Spacing.md}>
        {[1, 2, 3].map((i) => (
          <Box key={i} bg={Colors.surface} rounded={BorderRadius.lg} p={Spacing.lg}>
            <HStack justifyContent="space-between" alignItems="center" mb={Spacing.md}>
              <Skeleton
                h={6}
                w="40%"
                rounded={BorderRadius.md}
                startColor={Colors.neutral[200]}
                endColor={Colors.neutral[100]}
              />
              <Skeleton
                h={6}
                w="30%"
                rounded={BorderRadius.md}
                startColor={Colors.neutral[200]}
                endColor={Colors.neutral[100]}
              />
            </HStack>
            <Skeleton
              h={12}
              rounded={BorderRadius.md}
              startColor={Colors.neutral[200]}
              endColor={Colors.neutral[100]}
            />
          </Box>
        ))}
      </VStack>

      {/* Bookings List Skeleton */}
      <Box>
        <Skeleton
          h={6}
          w="50%"
          rounded={BorderRadius.md}
          mb={Spacing.lg}
          startColor={Colors.neutral[200]}
          endColor={Colors.neutral[100]}
        />
        <VStack space={Spacing.md}>
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              bg={Colors.surface}
              rounded={BorderRadius.lg}
              p={Spacing.lg}
              borderWidth={1}
              borderColor={Colors.neutral[200]}
            >
              <HStack justifyContent="space-between" mb={Spacing.md}>
                <Skeleton
                  h={5}
                  w="50%"
                  rounded={BorderRadius.md}
                  startColor={Colors.neutral[200]}
                  endColor={Colors.neutral[100]}
                />
                <Skeleton
                  h={5}
                  w="25%"
                  rounded={BorderRadius.md}
                  startColor={Colors.primaryShades[200]}
                  endColor={Colors.primaryShades[100]}
                />
              </HStack>
              <Skeleton
                h={4}
                w="70%"
                rounded={BorderRadius.md}
                startColor={Colors.neutral[200]}
                endColor={Colors.neutral[100]}
              />
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
};
