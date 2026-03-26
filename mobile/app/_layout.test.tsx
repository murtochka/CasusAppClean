import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NativeBaseProvider } from 'native-base'
import { theme } from '@/theme/theme'

export default function RootLayout() {
  return (
    <NativeBaseProvider theme={theme}>
      <View style={styles.container}>
        <Text style={styles.title}>🎉 CasusApp is Rendering!</Text>
        <Text style={styles.subtitle}>React Native is working!</Text>
        <Text style={styles.text}>If you see this, the UI works.</Text>
      </View>
    </NativeBaseProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D4C3C',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: '#E7E5E4',
    fontSize: 16,
    marginBottom: 8,
  },
  text: {
    color: '#C7E3D8',
    fontSize: 14,
  },
})
