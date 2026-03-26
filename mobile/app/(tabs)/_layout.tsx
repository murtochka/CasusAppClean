import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/constants'

export default function TabsLayout() {
  const { user } = useAuth()
  const isBusiness = user?.role === 'business'
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = ''

          if (route.name === 'index') {
            iconName = focused ? 'compass' : 'compass-outline'
          } else if (route.name === 'search') {
            iconName = focused ? 'search' : 'search-outline'
          } else if (route.name === 'bookings') {
            iconName = focused ? 'list' : 'list-outline'
          } else if (route.name === 'favorites') {
            iconName = focused ? 'heart' : 'heart-outline'
          } else if (route.name === 'profile') {
            iconName = focused ? 'person' : 'person-outline'
          } else if (route.name === 'guide-dashboard') {
            iconName = focused ? 'briefcase' : 'briefcase-outline'
          }

          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          href: null,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'My Bookings',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          href: null,
        }}
      />
      <Tabs.Screen
        name="guide-dashboard"
        options={{
          title: 'Dashboard',
          href: isBusiness ? '/(tabs)/guide-dashboard' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  )
}
