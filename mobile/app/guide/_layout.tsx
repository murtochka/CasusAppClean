import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Colors } from '@/constants'

export default function GuideLayout() {
  const isDark = useColorScheme() === 'dark'
  const bgColor = isDark ? Colors.dark.background : Colors.light.background
  const textColor = isDark ? Colors.dark.text : Colors.light.text

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: bgColor,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
          color: textColor,
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="create-activity"
        options={{
          title: 'Create Activity',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="activities"
        options={{
          title: 'My Activities',
        }}
      />
      <Stack.Screen
        name="bookings"
        options={{
          title: 'Guide Bookings',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="availability/[activityId]"
        options={{
          title: 'Manage Availability',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'Activity Details',
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: 'Edit Activity',
        }}
      />
    </Stack>
  )
}
