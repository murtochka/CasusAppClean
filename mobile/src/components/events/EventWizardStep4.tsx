import React, { useState } from 'react'
import { ScrollView, Text, StyleSheet, useColorScheme, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { Colors, Spacing, Typography } from '@/constants'
import { Button, Card } from '@/components/common'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

interface EventWizardStep4Props {
  coverImageUrl?: string
  tags: string[]
  capacity: number
  pricePerPerson: number
  onCoverImageChange: (uri: string) => void
  onTagsChange: (tags: string[]) => void
  onCapacityChange: (value: number) => void
  onPriceChange: (value: number) => void
  isLoading?: boolean
}

const SUGGESTED_TAGS = ['Beginner Friendly', 'All Ages', 'Indoor', 'Outdoor', 'Group Activity', 'Photography', 'Adventure', 'Cultural']

export const EventWizardStep4: React.FC<EventWizardStep4Props> = ({
  coverImageUrl,
  tags,
  capacity,
  pricePerPerson,
  onCoverImageChange,
  onTagsChange,
  onCapacityChange,
  onPriceChange,
  isLoading = false,
}) => {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const theme = isDark ? Colors.dark : Colors.light
  const styles = createStyles(theme)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [newTag, setNewTag] = useState('')

  const pickImage = async () => {
    try {
      setUploadingImage(true)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        onCoverImageChange(result.assets[0].uri)
      }
    } catch (err) {
      console.error('Failed to pick image:', err)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddTag = () => {
    if (newTag.trim() && tags.length < 5) {
      onTagsChange([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index))
  }

  const handleToggleSuggestedTag = (tag: string) => {
    if (tags.includes(tag)) {
      onTagsChange(tags.filter((t) => t !== tag))
    } else if (tags.length < 5) {
      onTagsChange([...tags, tag])
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.stepTitle}>Showcase & Details</Text>
      <Text style={styles.stepDescription}>
        Add a cover image and set event details like capacity and pricing.
      </Text>

      {/* Cover Image */}
      <View style={styles.section}>
        <Text style={styles.label}>Cover Image</Text>
        {coverImageUrl ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: coverImageUrl }} style={styles.coverImage} />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
              disabled={isLoading || uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="pencil" size={16} color="#fff" />
                  <Text style={styles.changeImageButtonText}>Change</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={pickImage}
            disabled={isLoading || uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color={theme.primary} size="large" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={40} color={theme.primary} />
                <Text style={styles.uploadButtonText}>Tap to Upload Cover Image</Text>
                <Text style={styles.uploadButtonSubtext}>16:9 aspect ratio recommended</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Tags */}
      <View style={styles.section}>
        <View style={styles.tagHeader}>
          <Text style={styles.label}>Tags (optional)</Text>
          <Text style={styles.tagCount}>{tags.length}/5</Text>
        </View>

        {/* Selected Tags */}
        {tags.length > 0 && (
          <View style={styles.selectedTags}>
            {tags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.selectedTag}
                onPress={() => handleRemoveTag(index)}
                disabled={isLoading}
              >
                <Text style={styles.selectedTagText}>{tag}</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggested Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.suggestedTagsLabel}>Quick pick:</Text>
          <View style={styles.suggestedTags}>
            {SUGGESTED_TAGS.filter((tag) => !tags.includes(tag)).map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.suggestedTag, tags.length >= 5 && styles.suggestedTagDisabled]}
                onPress={() => handleToggleSuggestedTag(tag)}
                disabled={isLoading || tags.length >= 5}
              >
                <Text style={styles.suggestedTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Tag Input */}
        {tags.length < 5 && (
          <View style={styles.customTagInput}>
            <TextInput
              placeholder="Add custom tag..."
              value={newTag}
              onChangeText={setNewTag}
              editable={!isLoading}
              maxLength={20}
              placeholderTextColor={theme.grayText}
              style={styles.customTagInputField}
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={isLoading || !newTag.trim()}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Capacity */}
      <View style={styles.section}>
        <Text style={styles.label}>Group Capacity (optional)</Text>
        <View style={styles.capacityRow}>
          <TouchableOpacity
            style={styles.capacityButton}
            onPress={() => onCapacityChange(Math.max(1, capacity - 1))}
            disabled={isLoading || capacity <= 1}
          >
            <Ionicons name="remove" size={20} color={theme.primary} />
          </TouchableOpacity>

          <View style={styles.capacityDisplay}>
            <Text style={styles.capacityValue}>{capacity}</Text>
            <Text style={styles.capacityLabel}>people</Text>
          </View>

          <TouchableOpacity
            style={styles.capacityButton}
            onPress={() => onCapacityChange(Math.min(1000, capacity + 1))}
            disabled={isLoading || capacity >= 1000}
          >
            <Ionicons name="add" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>Leave as 0 for unlimited capacity</Text>
      </View>

      {/* Price */}
      <View style={styles.section}>
        <Text style={styles.label}>Price Per Person (optional)</Text>
        <View style={styles.priceInput}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            placeholder="0.00"
            value={pricePerPerson > 0 ? pricePerPerson.toString() : ''}
            onChangeText={(text) => onPriceChange(parseFloat(text) || 0)}
            keyboardType="decimal-pad"
            editable={!isLoading}
            maxLength={10}
            placeholderTextColor={theme.grayText}
            style={styles.priceInputField}
          />
        </View>
        <Text style={styles.helperText}>Leave empty for free events</Text>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Event Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Capacity:</Text>
          <Text style={styles.summaryValue}>{capacity === 0 ? 'Unlimited' : `${capacity} people`}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Price:</Text>
          <Text style={styles.summaryValue}>{pricePerPerson > 0 ? `$${pricePerPerson.toFixed(2)}` : 'Free'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Image:</Text>
          <Text style={styles.summaryValue}>{coverImageUrl ? '✓ Added' : '○ Optional'}</Text>
        </View>
      </Card>

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
        <Text style={styles.tipText}>• Use high-quality images (landscape)</Text>
        <Text style={styles.tipText}>• Tags help people find your event</Text>
        <Text style={styles.tipText}>• Fair pricing attracts quality attendees</Text>
      </Card>
    </ScrollView>
  )
}

// Add TextInput import at the top of the file
import { TextInput } from 'react-native'

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
    section: {
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.sm,
    },
    imageWrapper: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.surface,
    },
    coverImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
    },
    changeImageButton: {
      position: 'absolute',
      bottom: Spacing.md,
      right: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    changeImageButtonText: {
      color: '#fff',
      fontSize: Typography.fontSize.small,
      fontWeight: '600',
    },
    uploadButton: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 200,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.primary,
      borderStyle: 'dashed',
      backgroundColor: theme.surface,
      gap: Spacing.sm,
    },
    uploadButtonText: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.primary,
    },
    uploadButtonSubtext: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
    },
    tagHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    tagCount: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
    },
    selectedTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    selectedTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      backgroundColor: theme.primary,
    },
    selectedTagText: {
      fontSize: Typography.fontSize.small,
      color: '#fff',
      fontWeight: '500',
    },
    tagsSection: {
      marginBottom: Spacing.md,
    },
    suggestedTagsLabel: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginBottom: Spacing.sm,
      fontWeight: '500',
    },
    suggestedTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    suggestedTag: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    suggestedTagDisabled: {
      opacity: 0.5,
    },
    suggestedTagText: {
      fontSize: Typography.fontSize.small,
      color: theme.text,
      fontWeight: '500',
    },
    customTagInput: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginTop: Spacing.md,
    },
    customTagInputField: {
      flex: 1,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      fontSize: Typography.fontSize.body,
      color: theme.text,
    },
    addTagButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    capacityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.lg,
      marginBottom: Spacing.md,
    },
    capacityButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.surface,
    },
    capacityDisplay: {
      flex: 1,
      alignItems: 'center',
    },
    capacityValue: {
      fontSize: Typography.fontSize.title,
      fontWeight: '600',
      color: theme.text,
    },
    capacityLabel: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
    },
    priceInput: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
      paddingHorizontal: Spacing.md,
      minHeight: 48,
    },
    currencySymbol: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginRight: Spacing.xs,
    },
    priceInputField: {
      flex: 1,
      fontSize: Typography.fontSize.body,
      color: theme.text,
      paddingVertical: Spacing.md,
    },
    helperText: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
      marginTop: Spacing.xs,
    },
    summaryCard: {
      backgroundColor: theme.surface,
      marginTop: Spacing.lg,
    },
    summaryTitle: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
      color: theme.text,
      marginBottom: Spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    summaryLabel: {
      fontSize: Typography.fontSize.small,
      color: theme.grayText,
    },
    summaryValue: {
      fontSize: Typography.fontSize.body,
      fontWeight: '600',
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
