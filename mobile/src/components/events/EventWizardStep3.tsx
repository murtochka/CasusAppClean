import React, { useState } from 'react'
import { ScrollView, Text, StyleSheet, useColorScheme, View, TextInput, TouchableOpacity } from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'
import { Input, Card } from '@/components/common'
import { Ionicons } from '@expo/vector-icons'

interface EventWizardStep3Props {
  address: string
  city: string
  latitude?: number
  longitude?: number
  onAddressChange: (text: string) => void
  onCityChange: (text: string) => void
  onLatitudeChange: (value: number) => void
  onLongitudeChange: (value: number) => void
  businessLocation?: { address: string; city: string; latitude: number; longitude: number }
  isLoading?: boolean
}

export const EventWizardStep3: React.FC<EventWizardStep3Props> = ({
  address,
  city,
  latitude,
  longitude,
  onAddressChange,
  onCityChange,
  onLatitudeChange,
  onLongitudeChange,
  businessLocation,
  isLoading = false,
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const [showCoordinates, setShowCoordinates] = useState(false)

  const handleUseBusinessLocation = () => {
    if (businessLocation) {
      onAddressChange(businessLocation.address)
      onCityChange(businessLocation.city)
      onLatitudeChange(businessLocation.latitude)
      onLongitudeChange(businessLocation.longitude)
    }
  }

  const hasCoordinates = latitude !== undefined && longitude !== undefined
  const coordinatesComplete = hasCoordinates && latitude !== 0 && longitude !== 0

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepTitle}>Location</Text>
      <Text style={styles.stepDescription}>
        Tell attendees where your event will be held. You can use your business location or enter a custom address.
      </Text>

      {/* Use Business Location */}
      {businessLocation && (
        <TouchableOpacity
          style={styles.businessLocationCard}
          onPress={handleUseBusinessLocation}
          disabled={isLoading}
        >
          <View style={styles.businessLocationHeader}>
            <Ionicons name="business" size={20} color={theme.primary} />
            <Text style={styles.businessLocationTitle}>Use Business Location</Text>
          </View>
          <Text style={styles.businessLocationText}>{businessLocation.address}</Text>
          <Text style={styles.businessLocationText}>{businessLocation.city}</Text>
          <View style={styles.businessLocationCoords}>
            <Text style={styles.coordText}>
              {businessLocation.latitude.toFixed(4)}, {businessLocation.longitude.toFixed(4)}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Address Input */}
      <View style={styles.section}>
        <Text style={styles.label}>Street Address *</Text>
        <Input
          placeholder="Enter street address (e.g., 123 Main St, Los Angeles)"
          value={address}
          onChangeText={onAddressChange}
          editable={!isLoading}
          maxLength={200}
          placeholderTextColor={theme.grayText}
          style={styles.input}
        />
      </View>

      {/* City Input */}
      <View style={styles.section}>
        <Text style={styles.label}>City *</Text>
        <Input
          placeholder="Enter city"
          value={city}
          onChangeText={onCityChange}
          editable={!isLoading}
          maxLength={100}
          placeholderTextColor={theme.grayText}
          style={styles.input}
        />
      </View>

      {/* Advanced: Coordinates */}
      <TouchableOpacity
        style={styles.coordinatesToggle}
        onPress={() => setShowCoordinates(!showCoordinates)}
        disabled={isLoading}
      >
        <Ionicons
          name={showCoordinates ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color={theme.primary}
        />
        <Text style={styles.coordinatesToggleText}>Advanced: Set Coordinates</Text>
      </TouchableOpacity>

      {showCoordinates && (
        <View style={styles.coordinatesSection}>
          <Text style={styles.sectionNote}>Optional: Set precise GPS coordinates for mapping</Text>

          <View style={styles.coordinateRow}>
            <View style={styles.coordinateInput}>
              <Text style={styles.label}>Latitude</Text>
              <TextInput
                placeholder="-90 to 90"
                value={latitude?.toString() || ''}
                onChangeText={(text) => onLatitudeChange(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                editable={!isLoading}
                placeholderTextColor={theme.grayText}
                style={styles.input}
              />
            </View>

            <View style={styles.coordinateInput}>
              <Text style={styles.label}>Longitude</Text>
              <TextInput
                placeholder="-180 to 180"
                value={longitude?.toString() || ''}
                onChangeText={(text) => onLongitudeChange(parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                editable={!isLoading}
                placeholderTextColor={theme.grayText}
                style={styles.input}
              />
            </View>
          </View>

          {coordinatesComplete && (
            <Card style={styles.coordCard}>
              <Ionicons name="map" size={20} color={theme.primary} />
              <Text style={styles.coordCardText}>
                {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* Map Preview Note */}
      <Card style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Map Preview</Text>
          <Text style={styles.infoText}>
            {address && city ? 'Your event location will be displayed on the map' : 'Add address to show on map'}
          </Text>
        </View>
      </Card>

      {/* Location Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>📍 Location Tips:</Text>
        <Text style={styles.tipText}>• Be specific - include landmarks if needed</Text>
        <Text style={styles.tipText}>• Parking info can go in the description</Text>
        <Text style={styles.tipText}>• For multi-stop events, put the starting point</Text>
      </Card>
    </ScrollView>
  )
}

const createStyles = (theme: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    stepTitle: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.xs,
    },
    stepDescription: {
      fontSize: Typography.fontSize.body,
      color: theme.grayText,
      marginBottom: Spacing.lg,
      lineHeight: 20,
    },
    businessLocationCard: {
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.primary,
      backgroundColor: theme.surface,
      padding: Spacing.md,
      marginBottom: Spacing.lg,
    },
    businessLocationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    businessLocationTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.primary,
    },
    businessLocationText: {
      fontSize: Typography.fontSize.small,
      color: theme.text,
      marginBottom: Spacing.xs,
    },
    businessLocationCoords: {
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    coordText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      fontFamily: 'monospace',
    },
    section: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    input: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: Spacing.md,
      fontSize: Typography.fontSize.body,
      color: theme.text,
      minHeight: 48,
    },
    coordinatesToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.lg,
      borderRadius: 8,
      backgroundColor: theme.surface,
    },
    coordinatesToggleText: {
      fontSize: Typography.fontSize.body,
      color: theme.primary,
      fontWeight: '500',
    },
    coordinatesSection: {
      marginBottom: Spacing.xl,
    },
    sectionNote: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginBottom: Spacing.md,
      fontStyle: 'italic',
    },
    coordinateRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.lg,
    },
    coordinateInput: {
      flex: 1,
    },
    coordCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.md,
      backgroundColor: theme.surface,
    },
    coordCardText: {
      fontSize: Typography.fontSize.small,
      color: theme.text,
      fontFamily: 'monospace',
      fontWeight: '500',
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginTop: Spacing.lg,
      backgroundColor: theme.surface,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
      color: theme.grayText,
      marginBottom: Spacing.xs,
    },
    infoText: {
      fontSize: Typography.fontSize.body,
      color: theme.text,
    },
    tipsCard: {
      backgroundColor: theme.surface,
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
      marginTop: Spacing.lg,
    },
    tipsTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    tipText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginBottom: Spacing.xs,
      lineHeight: 18,
    },
  })
