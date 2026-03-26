import React from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Text } from 'native-base'
import { theme } from '@/theme/theme'

interface CustomSplashScreenProps {
  loadingText?: string
  progress?: number // 0-3 for different stages
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ 
  loadingText = 'Initializing...', 
  progress = 0 
}) => {
  const stages = [
    'Initializing...',
    'Loading profile...',
    'Loading metadata...',
  ]

  const displayText = loadingText || stages[Math.min(progress, stages.length - 1)]

  return (
    <View 
      style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.primary[900],
      }}
    >
      <View style={{ alignItems: 'center', gap: 20 }}>
        <ActivityIndicator size="large" color={theme.colors.primary[50]} />
        <Text
          style={{
            color: theme.colors.primary[50],
            fontSize: 16,
            fontWeight: '500',
            textAlign: 'center',
          }}
        >
          {displayText}
        </Text>
      </View>
    </View>
  )
}
