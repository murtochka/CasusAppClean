import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>✅ UI WORKING</Text>
        <Text style={styles.subtitle}>React Native is rendering!</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D4C3C',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#E7E5E4',
    fontSize: 16,
    marginTop: 12,
  },
})
